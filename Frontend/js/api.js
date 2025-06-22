// Nordisk Film Booking System - API funktioner
console.log('API.js indlæst - Backend kommunikation tilgængelig');

// Globale API funktioner til kommunikation med backend
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Standard options med debugging
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        ...options
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
        console.log('Request body:', options.body);
    }

    try {
        const response = await fetch(url, defaultOptions);
        console.log(`API Response: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        return {
            success: response.ok,
            status: response.status,
            data: data
        };
    } catch (error) {
        console.error('API fejl:', error);
        return {
            success: false,
            error: error.message || 'Netværksfejl'
        };
    }
}

// Henter alle bookinger fra backend
async function fetchBookings() {
    console.log('Henter booking data fra backend...');
    
    const result = await makeApiRequest('/api/bookings');
    
    if (result.success) {
        console.log(`Booking data hentet succesfuldt - ${result.data.total_count} bookinger`);
        return result;
    } else {
        console.error('Fejl ved hentning af bookinger:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke hente bookinger');
        return result;
    }
}

// Henter en specifik booking baseret på ID
async function fetchBookingById(bookingId) {
    console.log(`Henter booking med ID: ${bookingId}`);
    
    const result = await makeApiRequest(`/api/bookings/${bookingId}`);
    
    if (result.success) {
        console.log('Booking hentet succesfuldt:', result.data.booking.title);
        return result;
    } else {
        console.error('Fejl ved hentning af booking:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke hente booking');
        return result;
    }
}

// Opretter ny booking via backend API
async function createBooking(bookingData) {
    console.log('Opretter ny booking via API...');
    console.log('Booking data:', bookingData);
    
    const result = await makeApiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
    
    if (result.success) {
        console.log('Booking oprettet succesfuldt med ID:', result.data.booking_id);
        showSuccess(result.data.message || 'Booking oprettet succesfuldt');
        return result;
    } else {
        console.error('Fejl ved oprettelse af booking:', result.data?.error || result.error);
        showError(result.data?.error || result.error || 'Kunne ikke oprette booking');
        return result;
    }
}

// Opdaterer en eksisterende booking
async function updateBooking(bookingId, bookingData) {
    console.log(`Opdaterer booking ${bookingId} via API...`);
    console.log('Opdateret booking data:', bookingData);
    
    const result = await makeApiRequest(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(bookingData)
    });
    
    if (result.success) {
        console.log('Booking opdateret succesfuldt');
        showSuccess(result.data.message || 'Booking opdateret succesfuldt');
        return result;
    } else {
        console.error('Fejl ved opdatering af booking:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke opdatere booking');
        return result;
    }
}

// Opdaterer booking status via backend API
async function updateBookingStatus(bookingId, newStatus) {
    console.log(`Opdaterer booking ${bookingId} status til: ${newStatus}`);
    
    const result = await makeApiRequest(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });
    
    if (result.success) {
        console.log('Booking status opdateret succesfuldt');
        showSuccess(result.data.message || 'Status opdateret succesfuldt');
        return result;
    } else {
        console.error('Fejl ved opdatering af booking status:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke opdatere status');
        return result;
    }
}

// Hjælpefunktioner til at vise beskeder til brugeren
function showSuccess(message) {
    console.log('Success:', message);
    // Implementer toast/notification system senere
    alert(message); // Midlertidig løsning
}

function showError(message) {
    console.error('Error:', message);
    // Implementer toast/notification system senere
    alert('Fejl: ' + message); // Midlertidig løsning
}

// Tjekker om backend API er tilgængeligt
async function checkApiHealth() {
    console.log('Tjekker backend API forbindelse...');
    const result = await makeApiRequest('/'); 
    if (result.success) {
        console.log('Backend API forbindelse er OK');
        return { success: true };
    } else {
        console.error('Backend API svarer ikke eller er nede.');
        showError('Kan ikke få forbindelse til backend. Prøv venligst igen senere.');
        return { success: false, error: 'API connection failed' };
    }
}

// Arkiv API funktioner jf. ønsket funktionalitet fra sedel
async function fetchActiveBookings() {
    console.log('Henter aktive booking data fra backend...');
    
    const result = await makeApiRequest('/api/bookings/active');
    
    if (result.success) {
        console.log(`Aktive booking data hentet succesfuldt - ${result.data.total_count} bookinger`);
        return result;
    } else {
        console.error('Fejl ved hentning af aktive bookinger:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke hente aktive bookinger');
        return result;
    }
}

async function fetchArchivedBookings() {
    console.log('Henter arkiverede booking data fra backend...');
    
    const result = await makeApiRequest('/api/bookings/archived');
    
    if (result.success) {
        console.log(`Arkiverede booking data hentet succesfuldt - ${result.data.total_count} bookinger`);
        console.log(`Faktura statistik:`, result.data.invoice_stats);
        return result;
    } else {
        console.error('Fejl ved hentning af arkiverede bookinger:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke hente arkiverede bookinger');
        return result;
    }
}

async function archiveBooking(bookingId) {
    console.log(`Arkiverer booking ${bookingId} via API...`);
    
    const result = await makeApiRequest(`/api/bookings/${bookingId}/archive`, {
        method: 'PUT'
    });
    
    if (result.success) {
        console.log('Booking arkiveret succesfuldt');
        showSuccess(result.data.message || 'Booking arkiveret succesfuldt');
        return result;
    } else {
        console.error('Fejl ved arkivering af booking:', result.error);
        showError(result.data?.error || result.error || 'Kunne ikke arkivere booking');
        return result;
    }
}

console.log('API funktioner defineret og klar til brug'); 