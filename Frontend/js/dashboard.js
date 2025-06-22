// Nordisk Film Booking System - Dashboard Funktioner
console.log('Dashboard.js indlæst - Dashboard funktioner tilgængelige');

// Global view state - delt mellem alle JS filer via window objekt
window.currentView = window.currentView || 'active';

// Opdaterer dashboard statistikker
function updateDashboardStats(data) {
    debugLog('Opdaterer dashboard statistikker');
    
    // Total bookinger
    const totalElement = document.getElementById('totalBookings');
    if (totalElement) {
        totalElement.textContent = data.total_count || 0;
        debugLog('Total bookinger opdateret:', data.total_count);
    }
    
    // Ventende bookinger
    const pendingElement = document.getElementById('pendingBookings');
    if (pendingElement) {
        pendingElement.textContent = data.status_counts?.pending || 0;
        debugLog('Ventende bookinger opdateret:', data.status_counts?.pending);
    }
    
    // Bekræftede bookinger
    const confirmedElement = document.getElementById('confirmedBookings');
    if (confirmedElement) {
        confirmedElement.textContent = data.status_counts?.confirmed || 0;
        debugLog('Bekræftede bookinger opdateret:', data.status_counts?.confirmed);
    }
    
    // Afsluttede bookinger
    const completedElement = document.getElementById('completedBookings');
    if (completedElement) {
        completedElement.textContent = data.status_counts?.completed || 0;
        debugLog('Afsluttede bookinger opdateret:', data.status_counts?.completed);
    }
    
    debugLog('Dashboard statistikker opdateret succesfuldt:', data.status_counts);
}

// Opdaterer arkiv statistikker jf. ønsket funktionalitet
function updateArchivedStats(data) {
    debugLog('Opdaterer arkiv statistikker');
    
    // Arkiverede bookinger total
    const archivedElement = document.getElementById('archivedBookings');
    if (archivedElement) {
        archivedElement.textContent = data.total_count || 0;
        debugLog('Arkiverede bookinger opdateret:', data.total_count);
    }
    
    // Fakturaer sendt statistik jf. sedel
    const invoicesElement = document.getElementById('invoicesSent');
    if (invoicesElement && data.invoice_stats) {
        invoicesElement.textContent = data.invoice_stats.sent || 0;
        debugLog('Fakturaer sendt opdateret:', data.invoice_stats.sent);
    }
    
    debugLog('Arkiv statistikker opdateret:', data.invoice_stats);
}

// Animerer statistik numre ved indlæsning
function animateStats() {
    debugLog('Animerer dashboard statistikker');
    
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((element, index) => {
        const finalValue = parseInt(element.textContent);
        let currentValue = 0;
        const increment = finalValue / 20; // 20 steps for animation
        
        const animation = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(animation);
            }
            element.textContent = Math.floor(currentValue);
        }, 50); // Animation duration: 1 second
    });
}

// Skifter mellem aktive og arkiverede bookinger jf. ønsket funktionalitet
function toggleView(view) {
    debugLog(`Skifter til ${view} visning`);
    
    // Opdater global view state
    window.currentView = view;
    
    // Opdater knap styling
    const activeBtn = document.getElementById('activeViewBtn');
    const archivedBtn = document.getElementById('archivedViewBtn');
    const sectionTitle = document.getElementById('sectionTitle');
    
    if (view === 'active') {
        activeBtn.classList.add('active');
        archivedBtn.classList.remove('active');
        sectionTitle.textContent = 'Aktuelle Bookinger';
        showActiveStats();
    } else {
        activeBtn.classList.remove('active');
        archivedBtn.classList.add('active');
        sectionTitle.textContent = 'Arkiverede Bookinger';
        showArchivedStats();
    }
    
    // Indlæs nye data baseret på visning
    loadDashboardData();
}

// Viser statistikker for aktive bookinger
function showActiveStats() {
    debugLog('Viser aktive booking statistikker');
    
    // Skjul arkiv statistikker
    const archivedCard = document.getElementById('archivedCard');
    const invoiceCard = document.getElementById('invoiceCard');
    
    if (archivedCard) archivedCard.style.display = 'none';
    if (invoiceCard) invoiceCard.style.display = 'none';
    
    // Vis standard statistikker
    const defaultCards = ['totalBookings', 'pendingBookings', 'confirmedBookings', 'completedBookings'];
    defaultCards.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.parentElement) {
            element.parentElement.style.display = 'block';
        }
    });
}

// Viser statistikker for arkiverede bookinger jf. sedel
function showArchivedStats() {
    debugLog('Viser arkiverede booking statistikker');
    
    // Skjul nogle standard statistikker
    const pendingCard = document.getElementById('pendingBookings')?.parentElement;
    if (pendingCard) pendingCard.style.display = 'none';
    
    // Vis arkiv statistikker
    const archivedCard = document.getElementById('archivedCard');
    const invoiceCard = document.getElementById('invoiceCard');
    
    if (archivedCard) archivedCard.style.display = 'block';
    if (invoiceCard) invoiceCard.style.display = 'block';
}

// Indlæser og viser dashboard data baseret på aktuel visning
async function loadDashboardData() {
    debugLog(`Indlæser dashboard data for ${window.currentView} visning`);
    
    let result;
    
    if (window.currentView === 'active') {
        result = await fetchActiveBookings();
    } else {
        result = await fetchArchivedBookings();
    }
    
    if (result.success) {
        if (window.currentView === 'active') {
            updateDashboardStats(result.data);
        } else {
            updateArchivedStats(result.data);
        }
        
        // Opdater global booking data cache
        if (result.data.bookings) {
            bookingsData = result.data.bookings;
            debugLog('Booking data cache opdateret med', bookingsData.length, 'bookinger');
            
            // Render bookings med opdateret data
            renderBookings(result.data.bookings);
        }
        
        // Animerer statistikkerne efter opdatering
        setTimeout(() => {
            animateStats();
        }, 100);
        
        return result.data;
    } else {
        debugLog('Fejl ved indlæsning af dashboard data:', result.error);
        return null;
    }
}

// Initialiserer arkiv event listeners
function initializeArchiveControls() {
    debugLog('Initialiserer arkiv kontroller');
    
    const activeBtn = document.getElementById('activeViewBtn');
    const archivedBtn = document.getElementById('archivedViewBtn');
    
    if (activeBtn) {
        activeBtn.addEventListener('click', () => toggleView('active'));
    }
    
    if (archivedBtn) {
        archivedBtn.addEventListener('click', () => toggleView('archived'));
    }
    
    debugLog('Arkiv kontroller initialiseret');
}

debugLog('Dashboard funktioner indlæst og klar'); 