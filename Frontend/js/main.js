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
    
    debugLog('Event listeners sat op');
}

// Indlæser initial data
async function loadInitialData() {
    debugLog('Indlæser initial applikation data');
    
    try {
        // Indlæser dashboard og booking data
        const dashboardData = await loadDashboardData();
        
        if (dashboardData) {
            debugLog('Initial data indlæst:', dashboardData.total_count, 'bookinger');
        }
        
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
    
    // Visibility change - refresh data når tab bliver synlig igen
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            debugLog('Tab blev synlig - refresher data');
            refreshData();
        }
    });
    
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
        await loadBookingsData();
        
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