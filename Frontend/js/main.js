// Nordisk Film Booking System - Hovedfil
console.log('Main.js indlæst - Initialiserer applikation');

// Applikation initialisering
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM indlæst - starter applikation initialisering');
    initializeApplication();
});

// Hovedfunktion til initialisering af applikationen
async function initializeApplication() {
    debugLog('Initialiserer Nordisk Film Booking System');
    
    try {
        // 1. Initialiserer API forbindelse
        debugLog('Trin 1: Tjekker API forbindelse');
        const apiResult = await checkApiHealth();
        
        if (!apiResult.success) {
            console.error('API forbindelse fejlede');
            return;
        }
        
        // 2. Sætter event listeners
        debugLog('Trin 2: Sætter event listeners');
        setupEventListeners();
        
        // 3. Indlæser initial data
        debugLog('Trin 3: Indlæser booking data');
        await loadInitialData();
        
        debugLog('Applikation initialiseret succesfuldt');
        
    } catch (error) {
        console.error('Fejl ved applikation initialisering:', error);
        showError('Fejl ved start af applikation. Genindlæs siden.');
    }
}

// Sætter alle event listeners
function setupEventListeners() {
    debugLog('Sætter applikation event listeners');
    
    // Globale keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Window event listeners
    setupWindowEventListeners();
    
    // Arkiv kontroller jf. ønsket funktionalitet
    initializeArchiveControls();
    
    debugLog('Event listeners sat op');
}

// Indlæser initial data
async function loadInitialData() {
    debugLog('Indlæser initial applikation data');
    
    try {
        // Venter lidt ekstra for at sikre DOM er helt klar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Tjekker at booking container eksisterer før loading
        const container = document.getElementById('bookingsContainer');
        if (!container) {
            console.error('Booking container ikke fundet ved initial load');
            // Forsøger igen efter kort delay
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Indlæser dashboard og booking data
        const dashboardData = await loadDashboardData();
        
        if (dashboardData) {
            debugLog('Initial data indlæst:', dashboardData.total_count, 'bookinger');
            
            // Render bookings hvis der er data - dette var det manglende stykke!
            if (dashboardData.bookings && dashboardData.bookings.length > 0) {
                debugLog('Renderer bookings på siden');
                renderBookings(dashboardData.bookings);
            }
        }
        
        // Ekstra sikkerhed - force refresh hvis ingen data vises
        setTimeout(() => {
            const container = document.getElementById('bookingsContainer');
            if (container && container.children.length === 0) {
                console.warn('Ingen booking kort synlige efter initial load - forsøger genindlæsning');
                loadDashboardData();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Fejl ved indlæsning af initial data:', error);
        showError('Fejl ved indlæsning af data');
    }
}

// Sætter keyboard shortcuts
function setupKeyboardShortcuts() {
    debugLog('Sætter keyboard shortcuts');
    
    document.addEventListener('keydown', function(e) {
        // Ctrl+N eller Cmd+N for ny booking
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openCreateModal();
            debugLog('Keyboard shortcut: Ny booking');
        }
        
        // F5 for refresh data
        if (e.key === 'F5') {
            e.preventDefault();
            refreshData();
            debugLog('Keyboard shortcut: Refresh data');
        }
    });
}

// Sætter window event listeners
function setupWindowEventListeners() {
    debugLog('Sætter window event listeners');
    
    // Variable til at undgå multiple refresh calls
    let refreshTimeout = null;
    let isInitialLoad = true;
    
    // Visibility change - refresh data når tab bliver synlig igen (men ikke ved initial load)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Skip refresh ved initial load for at undgå race condition
            if (isInitialLoad) {
                debugLog('Tab blev synlig - springer refresh over (initial load)');
                isInitialLoad = false;
                return;
            }
            
            debugLog('Tab blev synlig - refresher data');
            
            // Debounce refresh for at undgå multiple calls
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
            
            refreshTimeout = setTimeout(() => {
                refreshData();
                refreshTimeout = null;
            }, 500); // 500ms delay
        }
    });
    
    // Reset initial load flag efter 5 sekunder
    setTimeout(() => {
        isInitialLoad = false;
        debugLog('Initial load periode afsluttet - visibility refresh aktiveret');
    }, 5000);
    
    // Før side forlades
    window.addEventListener('beforeunload', function(e) {
        const modal = document.getElementById('createModal');
        if (modal && modal.style.display === 'block') {
            e.preventDefault();
            e.returnValue = 'Du har en åben booking modal. Er du sikker på at du vil forlade siden?';
        }
    });
}

// Refresher alle data
async function refreshData() {
    debugLog('Refresher applikation data');
    
    try {
        // Viser indlæsning i dashboard
        const container = document.getElementById('bookingsContainer');
        if (container) {
            showLoader(container);
        }
        
        // Indlæser frisk data
        const data = await loadDashboardData();
        
        // Render bookings efter data refresh
        if (data && data.bookings) {
            renderBookings(data.bookings);
        }
        
        debugLog('Data refreshet succesfuldt');
        
    } catch (error) {
        console.error('Fejl ved data refresh:', error);
        showError('Fejl ved opdatering af data');
    }
}

// Error handler for uventede fejl
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    debugLog('Global fejl fanget:', e.message);
    
    // Vis ikke fejl til bruger for alle errors - kun kritiske
    if (e.error && e.error.message && e.error.message.includes('API')) {
        showError('Systemfejl. Kontakt support hvis problemet fortsætter.');
    }
});

// Console velkomstbesked
console.log(`
╔══════════════════════════════════════════════╗
║         Nordisk Film Booking System         ║
║                                              ║
║  Frontend klient initialiseret succesfuldt  ║
║                                              ║
║  Debug mode: ${DEBUG_MODE ? 'Aktiveret' : 'Deaktiveret'}              ║
║  API URL: ${API_BASE_URL}           ║
╚══════════════════════════════════════════════╝
`);

debugLog('Main.js indlæst og applikation klar til brug'); 