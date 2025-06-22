// Nordisk Film Booking System - Dashboard Funktioner
console.log('Dashboard.js indlæst - Dashboard funktioner tilgængelige');

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

// Indlæser og viser dashboard data
async function loadDashboardData() {
    debugLog('Indlæser dashboard data');
    
    const result = await fetchBookings();
    
    if (result.success) {
        updateDashboardStats(result.data);
        
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

debugLog('Dashboard funktioner indlæst og klar'); 