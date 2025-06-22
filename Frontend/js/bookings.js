// Nordisk Film Booking System - Booking Funktioner
console.log('Bookings.js indlæst - Booking funktioner tilgængelige');

// Globale variabler
var currentSortField = 'booking_date';
var currentSortDirection = 'desc';

// Renderer booking kort i DOM
function renderBookings(bookings) {
    console.log(`Renderer ${bookings.length} booking kort`);
    
    const container = document.getElementById('bookingsContainer');
    if (!container) {
        console.error('Booking container ikke fundet - DOM muligvis ikke klar');
        return;
    }

    // Debug container state
    console.log('Container fundet:', container);
    console.log('Container synlig:', container.offsetParent !== null);
    
    // Tømmer container
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <h3>Ingen bookinger fundet</h3>
                <p>Opret din første booking ved at klikke på plus knappen</p>
            </div>
        `;
        console.log('Viser "ingen bookinger" besked');
        return;
    }

    // Sorter bookings baseret på nuværende sort indstillinger
    const sortedBookings = sortBookings(bookings, currentSortField, currentSortDirection);

    // Opretter booking kort for hver booking med animationsdelay
    sortedBookings.forEach((booking, index) => {
        const bookingCard = createBookingCard(booking);
        
        // Tilføjer animation delay for smooth loading
        bookingCard.style.animationDelay = `${index * 100}ms`;
        bookingCard.classList.add('fade-in');
        
        container.appendChild(bookingCard);
        
        // Force reflow for at sikre synlighed
        bookingCard.offsetHeight;
    });

    // Debug final state
    console.log('Booking kort renderet succesfuldt');
    console.log('Container indhold længde:', container.children.length);
    console.log('Container HTML set:', container.innerHTML.length > 0);
    
    // Force container refresh hvis den ikke er synlig
    if (container.offsetParent === null) {
        console.warn('Container ikke synlig efter rendering - forsøger fix');
        setTimeout(() => {
            container.style.display = 'block';
            container.style.visibility = 'visible';
        }, 100);
    }
}

// Sorterer bookings baseret på felt og retning
function sortBookings(bookings, field, direction) {
    return [...bookings].sort((a, b) => {
        let aValue = a[field] || '';
        let bValue = b[field] || '';
        
        // Konverterer til sammenlignelige typer
        if (field === 'booking_date' || field === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });
}

// Opretter et enkelt booking kort element med udvidede oplysninger
function createBookingCard(booking) {
    console.log('Opretter booking kort for:', booking.title);
    
    const card = document.createElement('div');
    card.className = 'booking-card';
    card.dataset.bookingId = booking.id;

    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    
    // Tæller antal bekræftede punkter
    const confirmationFields = [
        'time_confirmed', 'film_confirmed', 'price_confirmed', 'ticket_price_sent',
        'extra_staff', 'staff_informed', 'tickets_reserved', 'terms_written'
    ];
    const confirmedCount = confirmationFields.filter(field => booking[field]).length;
    const totalFields = confirmationFields.length;
    
    card.innerHTML = `
        <div class="booking-header">
            <div class="booking-info">
                <h3 class="booking-title">${escapeHtml(booking.title)}</h3>
                <p class="booking-client">${escapeHtml(booking.client_name)}</p>
                ${booking.email ? `<p class="booking-email">${escapeHtml(booking.email)}</p>` : ''}
            </div>
            <div class="booking-actions">
                <span class="status-badge ${statusConfig.class}" onclick="changeBookingStatus(${booking.id}, '${booking.status}')">
                    ${statusConfig.label}
                </span>
                <button class="edit-btn" onclick="openEditPage(${booking.id})" title="Rediger booking">
                    ✏️
                </button>
            </div>
        </div>
        
        <div class="booking-details">
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">Dato</div>
                    <div class="detail-value">${formatDate(booking.booking_date)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Tid</div>
                    <div class="detail-value">${booking.start_time} - ${booking.end_time}</div>
                </div>
                ${booking.participant_count ? `
                    <div class="detail-item">
                        <div class="detail-label">Deltagere</div>
                        <div class="detail-value">${booking.participant_count}</div>
                    </div>
                ` : ''}
            </div>
            
            ${booking.film_title ? `
                <div class="detail-row">
                    <div class="detail-item full-width">
                        <div class="detail-label">Film</div>
                        <div class="detail-value">${escapeHtml(booking.film_title)}</div>
                    </div>
                </div>
            ` : ''}
            
            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-label">Bekræftelser</span>
                    <span class="progress-count">${confirmedCount}/${totalFields}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(confirmedCount / totalFields) * 100}%"></div>
                </div>
            </div>
            
            <div class="confirmation-grid">
                ${booking.time_confirmed ? '<span class="confirmation-badge confirmed">Tid ✓</span>' : '<span class="confirmation-badge">Tid</span>'}
                ${booking.film_confirmed ? '<span class="confirmation-badge confirmed">Film ✓</span>' : '<span class="confirmation-badge">Film</span>'}
                ${booking.catering_required ? '<span class="confirmation-badge confirmed">Forplejning ✓</span>' : ''}
                ${booking.own_room ? '<span class="confirmation-badge confirmed">Egen sal ✓</span>' : ''}
                ${booking.foyer_required ? '<span class="confirmation-badge confirmed">Foyer ✓</span>' : ''}
                ${booking.tech_required ? '<span class="confirmation-badge confirmed">Teknik ✓</span>' : ''}
                ${booking.price_confirmed ? '<span class="confirmation-badge confirmed">Pris ✓</span>' : '<span class="confirmation-badge">Pris</span>'}
                ${booking.ticket_price_sent ? '<span class="confirmation-badge confirmed">Billetpris ✓</span>' : '<span class="confirmation-badge">Billetpris</span>'}
                ${booking.extra_staff ? '<span class="confirmation-badge confirmed">Personale ✓</span>' : '<span class="confirmation-badge">Personale</span>'}
                ${booking.staff_informed ? '<span class="confirmation-badge confirmed">Info ✓</span>' : '<span class="confirmation-badge">Info</span>'}
                ${booking.tickets_reserved ? '<span class="confirmation-badge confirmed">Billetter ✓</span>' : '<span class="confirmation-badge">Billetter</span>'}
                ${booking.terms_written ? '<span class="confirmation-badge confirmed">Betingelser ✓</span>' : '<span class="confirmation-badge">Betingelser</span>'}
                ${booking.on_special_list ? '<span class="confirmation-badge special">Særliste ✓</span>' : ''}
            </div>
        </div>
        
        ${booking.description ? `
            <div class="booking-description">
                <div class="detail-label">Beskrivelse</div>
                <div class="detail-value">${escapeHtml(booking.description)}</div>
            </div>
        ` : ''}
        
        ${booking.catering_details ? `
            <div class="booking-description">
                <div class="detail-label">Forplejning</div>
                <div class="detail-value">${escapeHtml(booking.catering_details)}</div>
            </div>
        ` : ''}
    `;

    return card;
}

// Håndterer ændring af booking status
async function changeBookingStatus(bookingId, currentStatus) {
    console.log(`Ændrer status for booking ${bookingId} fra ${currentStatus}`);
    
    // Definerer tilgængelige status overgange
    const statusOptions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        completed: ['confirmed'],
        cancelled: ['pending']
    };

    const availableStatuses = statusOptions[currentStatus] || [];
    
    if (availableStatuses.length === 0) {
        showError('Ingen tilgængelige status ændringer for denne booking');
        return;
    }

    // Opretter status valg dialog
    let newStatus;
    if (availableStatuses.length === 1) {
        newStatus = availableStatuses[0];
    } else {
        // Simpel prompt for nu - kan forbedres med modal senere
        const statusLabels = availableStatuses.map(status => 
            `${status}: ${STATUS_CONFIG[status].label}`
        ).join('\n');
        
        const choice = prompt(`Vælg ny status:\n${statusLabels}\n\nSkriv status navn:`);
        if (!choice || !availableStatuses.includes(choice)) {
            return;
        }
        newStatus = choice;
    }

    // Sender API request til status opdatering
    const result = await updateBookingStatus(bookingId, newStatus);
    
    if (result.success) {
        // Genindlæser bookinger for at vise opdatering
        loadBookingsData();
    }
}

// Håndterer sortering af bookings
function handleSortChange(event) {
    const newSortField = event.target.value;
    
    // Skifter retning hvis samme felt vælges igen
    if (newSortField === currentSortField) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = newSortField;
        currentSortDirection = 'desc';
    }
    
    console.log(`Sortering ændret: ${currentSortField} ${currentSortDirection}`);
    
    // Genrenderer bookings med ny sortering
    renderBookings(bookingsData);
}

// Indlæser alle booking data og opdaterer visning
async function loadBookingsData() {
    console.log('Indlæser booking data til visning');
    
    const result = await fetchBookings();
    
    if (result.success) {
        bookingsData = result.data.bookings;
        renderBookings(result.data.bookings);
        updateDashboardStats(result.data);
        return result.data;
    } else {
        console.log('Fejl ved indlæsning af booking data:', result.error);
        return null;
    }
}

// Åbner edit side for en specifik booking
function openEditPage(bookingId) {
    console.log(`Navigerer til edit side for booking ${bookingId}`);
    
    // Navigerer til edit-booking siden med booking ID som parameter
    window.location.href = `/html/edit-booking.html?id=${bookingId}`;
}

// Initialiserer booking funktionalitet
document.addEventListener('DOMContentLoaded', function() {
    // Sorterings dropdown event listener
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
        console.log('Sort select event listener tilføjet');
    }
    
    // Create booking knap
    const createBtn = document.getElementById('createBtn');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateModal);
        console.log('Create button event listener tilføjet');
    }
    
    console.log('Booking funktionalitet initialiseret');
});

console.log('Booking funktioner indlæst og klar'); 