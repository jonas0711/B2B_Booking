// Nordisk Film Booking System - Hjælpefunktioner
console.log('Utils.js indlæst - Hjælpefunktioner tilgængelige');

// Escape HTML for sikkerhed
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Formaterer dato til dansk format
function formatDate(dateString) {
    debugLog('Formaterer dato:', dateString);
    
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        
        return date.toLocaleDateString('da-DK', options);
    } catch (error) {
        console.error('Fejl ved dato formatering:', error);
        return dateString;
    }
}

// Formaterer tid til dansk format
function formatTime(timeString) {
    debugLog('Formaterer tid:', timeString);
    
    try {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error('Fejl ved tid formatering:', error);
        return timeString;
    }
}

// Formaterer status til dansk
function formatStatus(status) {
    debugLog('Formaterer status:', status);
    
    const statusConfig = STATUS_CONFIG[status];
    if (statusConfig) {
        return statusConfig.label;
    }
    
    // Fallback hvis status ikke findes
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Viser fejlbesked til brugeren
function showError(message) {
    debugLog('Viser fejlbesked:', message);
    
    // Fjerner eksisterende beskeder
    removeExistingMessages();
    
    // Opretter fejlbesked element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Tilføjer til container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        
        // Automatisk fjernelse efter 5 sekunder
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Viser succesbesked til brugeren
function showSuccess(message) {
    debugLog('Viser succesbesked:', message);
    
    // Fjerner eksisterende beskeder
    removeExistingMessages();
    
    // Opretter succesbesked element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Tilføjer til container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(successDiv, container.firstChild);
        
        // Automatisk fjernelse efter 3 sekunder
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Fjerner eksisterende beskeder
function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(message => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    });
}

// Validerer email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validerer telefonnummer format
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// Konverterer minutter til timer og minutter
function minutesToHoursMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
        return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
        return `${hours} time${hours > 1 ? 'r' : ''}`;
    } else {
        return `${hours} time${hours > 1 ? 'r' : ''} ${remainingMinutes} min`;
    }
}

// Beregner varighed mellem to tidspunkter
function calculateDuration(startTime, endTime) {
    debugLog('Beregner varighed:', startTime, endTime);
    
    try {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        
        const diffMs = end - start;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        return minutesToHoursMinutes(diffMinutes);
    } catch (error) {
        console.error('Fejl ved beregning af varighed:', error);
        return 'Ukendt';
    }
}

// Debounce funktion til søgning
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loader utility til at vise indlæsning
function showLoader(container) {
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <h3>Indlæser...</h3>
                <p>Vent venligst</p>
            </div>
        `;
    }
}

debugLog('Hjælpefunktioner indlæst og klar'); 