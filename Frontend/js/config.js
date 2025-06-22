// Nordisk Film Booking System - Konfiguration
console.log('Config.js indlæst - Globale indstillinger defineret');

// API konfiguration
const API_BASE_URL = 'http://localhost:5000';

// Globale variabler til booking data - defineres i bookings.js
// let bookingsData = []; // Flyttet til bookings.js for at undgå duplication

// API endpoints - inkluderer arkiv funktionalitet
const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    HEALTH: '/',
    BOOKINGS: '/api/bookings',
    ACTIVE_BOOKINGS: '/api/bookings/active',
    ARCHIVED_BOOKINGS: '/api/bookings/archived',
    UPDATE_STATUS: '/api/bookings/{id}/status',
    ARCHIVE_BOOKING: '/api/bookings/{id}/archive'
};

// Status farver og labels
const STATUS_CONFIG = {
    pending: {
        label: 'Ventende',
        color: '#ffc107',
        class: 'status-pending'
    },
    confirmed: {
        label: 'Bekræftet',
        color: '#4caf50',
        class: 'status-confirmed'
    },
    completed: {
        label: 'Afsluttet',
        color: '#2196f3',
        class: 'status-completed'
    },
    cancelled: {
        label: 'Annulleret',
        color: '#f44336',
        class: 'status-cancelled'
    }
};

// Debug indstillinger
const DEBUG_MODE = true;

// Logging funktion til debug
function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
}

debugLog('Nordisk Film Booking System konfiguration indlæst'); 