// Nordisk Film Booking System - Booking Funktioner
console.log('Bookings.js indlæst - Booking funktioner tilgængelige');

// Globale variabler
var currentSortField = 'booking_date';
var currentSortDirection = 'desc';
var bookingsData = []; // Global booking data cache - defineret her for at undgå duplication
// Global view state - delt mellem alle JS filer
window.currentView = window.currentView || 'active';
var currentView = window.currentView;

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
    
    // Tømmer container - fjerner både placeholder og existing content
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-bookings">
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
    console.log('Første booking titel:', bookings[0]?.title || 'N/A');
    
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
    const displayTitle = booking.title || booking.client_name || 'Booking #' + booking.id;
    console.log('Opretter booking kort for:', displayTitle);
    
    const card = document.createElement('div');
    // Tilføj status klasse for farvekoordinering af kort
    const statusClass = booking.is_archived ? 'archived' : booking.status;
    card.className = `booking-card ${statusClass}`;
    card.dataset.bookingId = booking.id;

    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    
    // Fjernet bekræftelsestæller jf. ønsket rettelse
    
    card.innerHTML = `
        <div class="booking-header">
            <div class="booking-info">
                <h3 class="booking-title" onclick="editBookingField(${booking.id}, 'title')" title="Klik for at redigere titel">${escapeHtml(booking.title || booking.client_name || 'Booking #' + booking.id)}</h3>
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
                ${!booking.is_archived && window.currentView === 'active' ? `
                    <button class="archive-btn" onclick="handleArchiveBooking(${booking.id})" title="Arkiver booking">
                        📁
                    </button>
                ` : ''}
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
                <div class="detail-item">
                    <div class="detail-label">Biograf</div>
                    <div class="detail-value">${booking.cinema_location || 'Ikke valgt'}</div>
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
            
            <!-- Bekræftelser progress sektion fjernet jf. ønsket rettelse -->
            
            <div class="confirmation-grid">
                ${booking.start_time && booking.end_time ? '<span class="confirmation-badge ' + (booking.time_confirmed ? 'confirmed' : '') + '" onclick="editBookingTime(' + booking.id + ')">Tid: ' + booking.start_time + ' - ' + booking.end_time + '</span>' : '<span class="confirmation-badge" onclick="editBookingTime(' + booking.id + ')">Tid</span>'}
                ${booking.film_confirmed || booking.film_title ? '<span class="confirmation-badge confirmed" onclick="editBookingField(' + booking.id + ', \'film_title\')">Film: ' + escapeHtml(booking.film_title || 'Ja') + '</span>' : '<span class="confirmation-badge" onclick="editBookingField(' + booking.id + ', \'film_title\')">Film: Nej</span>'}
                ${booking.catering_required || booking.catering_details ? '<span class="confirmation-badge confirmed" onclick="editBookingField(' + booking.id + ', \'catering_details\')">Forplejning ✓</span>' : '<span class="confirmation-badge" onclick="editBookingField(' + booking.id + ', \'catering_details\')">Forplejning</span>'}
                ${booking.tech_required || booking.tech_details ? '<span class="confirmation-badge confirmed" onclick="editBookingField(' + booking.id + ', \'tech_details\')">Teknik ✓</span>' : '<span class="confirmation-badge" onclick="editBookingField(' + booking.id + ', \'tech_details\')">Teknik</span>'}
                ${booking.own_room ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'own_room\')">Egen sal ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'own_room\')">Egen sal</span>'}
                ${booking.foyer_required ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'foyer_required\')">Foyer ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'foyer_required\')">Foyer</span>'}
                ${booking.arrangement_price ? '<span class="confirmation-badge confirmed" onclick="editBookingField(' + booking.id + ', \'arrangement_price\')">Pris: ' + booking.arrangement_price + ' kr</span>' : '<span class="confirmation-badge" onclick="editBookingField(' + booking.id + ', \'arrangement_price\')">Pris</span>'}
                ${booking.price_confirmed ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'price_confirmed\')">Pris bekræftet ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'price_confirmed\')">Pris bekræftet</span>'}
                ${booking.ticket_price_sent ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'ticket_price_sent\')">Billetpris sendt ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'ticket_price_sent\')">Billetpris sendt</span>'}
                ${booking.extra_staff ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'extra_staff\')">Personale ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'extra_staff\')">Personale</span>'}
                ${booking.staff_informed ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'staff_informed\')">Info ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'staff_informed\')">Info</span>'}
                ${booking.tickets_reserved ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'tickets_reserved\')">Billetter ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'tickets_reserved\')">Billetter</span>'}
                ${booking.terms_written ? '<span class="confirmation-badge confirmed" onclick="toggleBookingField(' + booking.id + ', \'terms_written\')">Betingelser ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'terms_written\')">Betingelser</span>'}
                ${booking.on_special_list ? '<span class="confirmation-badge special" onclick="toggleBookingField(' + booking.id + ', \'on_special_list\')">Særliste ✓</span>' : '<span class="confirmation-badge" onclick="toggleBookingField(' + booking.id + ', \'on_special_list\')">Særliste</span>'}
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
        
        ${booking.tech_details ? `
            <div class="booking-description">
                <div class="detail-label">Teknik</div>
                <div class="detail-value">${escapeHtml(booking.tech_details)}</div>
            </div>
        ` : ''}
    `;

    // Tilføj arkiv information hvis det er en arkiveret booking
    if (booking.is_archived && window.currentView === 'archived') {
        updateArchivedCard(booking);
    }

    return card;
}

// Håndterer ændring af booking status
async function changeBookingStatus(bookingId, currentStatus) {
    console.log(`Ændrer status for booking ${bookingId} fra ${currentStatus}`);
    
    // Definerer tilgængelige status overgange
    const statusOptions = {
        pending: [
            { value: 'confirmed', label: 'Bekræftet', desc: 'Markér som bekræftet' },
            { value: 'cancelled', label: 'Annulleret', desc: 'Annullér bookingen' }
        ],
        confirmed: [
            { value: 'completed', label: 'Afsluttet', desc: 'Markér som afsluttet' },
            { value: 'cancelled', label: 'Annulleret', desc: 'Annullér bookingen' }
        ],
        completed: [
            { value: 'confirmed', label: 'Bekræftet', desc: 'Genåbn som bekræftet' }
        ],
        cancelled: [
            { value: 'pending', label: 'Ventende', desc: 'Genåbn som ventende' }
        ]
    };

    const availableStatuses = statusOptions[currentStatus] || [];
    
    if (availableStatuses.length === 0) {
        showError('Ingen tilgængelige status ændringer for denne booking');
        return;
    }

    // Opretter status valg modal
    const modal = createStatusModal(availableStatuses, async (newStatus) => {
        if (newStatus) {
            console.log(`Ændrer status til: ${newStatus}`);
            
            // Sender API request til status opdatering
            const result = await updateBookingStatus(bookingId, newStatus);
            
            if (result.success) {
                // Genindlæser bookinger for at vise opdatering
                await loadBookingsData();
                showSuccess(`Status ændret til ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
            } else {
                showError('Fejl ved ændring af status: ' + (result.error || 'Ukendt fejl'));
            }
        }
        // Fjern modal
        document.body.removeChild(modal);
    });
    
    // Vis modal
    document.body.appendChild(modal);
}

// Opretter en pæn status ændring modal
function createStatusModal(statusOptions, callback) {
    const modal = document.createElement('div');
    modal.className = 'status-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'status-modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #333;">Ændr Status</h3>
        <p style="margin: 0 0 20px 0; color: #666;">Vælg ny status for denne booking:</p>
        <div class="status-options" style="margin-bottom: 20px;">
            ${statusOptions.map(option => `
                <button class="status-option-btn" data-status="${option.value}" 
                        style="display: block; width: 100%; padding: 12px; margin-bottom: 8px; 
                               border: 1px solid #ddd; background: white; border-radius: 4px; 
                               cursor: pointer; text-align: left; transition: all 0.2s;">
                    <strong>${option.label}</strong>
                    <div style="font-size: 0.9em; color: #666; margin-top: 4px;">${option.desc}</div>
                </button>
            `).join('')}
        </div>
        <div style="text-align: right;">
            <button class="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; 
                                               background: white; border-radius: 4px; cursor: pointer; 
                                               margin-right: 8px;">Annullér</button>
        </div>
    `;
    
    // Event listeners
    modalContent.querySelectorAll('.status-option-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#f5f5f5';
            btn.style.borderColor = '#007bff';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'white';
            btn.style.borderColor = '#ddd';
        });
        btn.addEventListener('click', () => {
            callback(btn.dataset.status);
        });
    });
    
    modalContent.querySelector('.cancel-btn').addEventListener('click', () => {
        callback(null);
    });
    
    // Luk ved klik på overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            callback(null);
        }
    });
    
    modal.appendChild(modalContent);
    return modal;
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

// Indlæser alle booking data og opdaterer visning baseret på aktuel view
async function loadBookingsData() {
    console.log(`Indlæser booking data til visning: ${window.currentView}`);
    
    let result;
    
    // Brug rigtig API endpoint baseret på view
    if (window.currentView === 'active') {
        result = await fetchActiveBookings();
    } else if (window.currentView === 'archived') {
        result = await fetchArchivedBookings();
    } else {
        // Fallback til alle bookinger
        result = await fetchBookings();
    }
    
    if (result.success) {
        bookingsData = result.data.bookings;
        renderBookings(result.data.bookings);
        
        // Opdater korrekte statistikker baseret på view
        if (window.currentView === 'active') {
            updateDashboardStats(result.data);
        } else if (window.currentView === 'archived') {
            updateArchivedStats(result.data);
        } else {
            updateDashboardStats(result.data);
        }
        
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

// Arkiv funktioner jf. ønsket funktionalitet fra sedel
async function handleArchiveBooking(bookingId) {
    console.log(`Arkiverer booking ${bookingId}`);
    
    // Bekræft arkivering
    if (!confirm('Er du sikker på at du vil arkivere denne booking? Den flyttes til arkivet.')) {
        return;
    }
    
    // Send arkivering request
    const result = await archiveBooking(bookingId);
    
    if (result.success) {
        // Genindlæs data for at opdatere visning
        await loadDashboardData();
        showSuccess('Booking arkiveret succesfuldt');
    }
}

// Opdaterer booking kort for arkiverede bookinger med faktura info
function updateArchivedCard(booking) {
    // Tilføjer faktura information til arkiverede bookinger
    const card = document.querySelector(`[data-booking-id="${booking.id}"]`);
    if (!card || !booking.is_archived) return;
    
    // Tilføjer arkiv information
    const detailsSection = card.querySelector('.booking-details');
    if (detailsSection) {
        const archiveInfo = document.createElement('div');
        archiveInfo.className = 'archive-info';
        archiveInfo.innerHTML = `
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">Faktura Status</div>
                    <div class="detail-value">
                        <span class="confirmation-badge ${booking.invoice_sent ? 'confirmed' : ''}">
                            ${booking.invoice_sent ? 'Sendt ✓' : 'Ikke sendt'}
                        </span>
                    </div>
                </div>
                ${booking.invoice_file_path ? `
                    <div class="detail-item">
                        <div class="detail-label">Faktura Fil</div>
                        <div class="detail-value">
                            <a href="${booking.invoice_file_path}" target="_blank">Se faktura</a>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${booking.revenue_analysis ? `
                <div class="detail-row">
                    <div class="detail-item full-width">
                        <div class="detail-label">Indtægtsanalyse</div>
                        <div class="detail-value">${escapeHtml(booking.revenue_analysis)}</div>
                    </div>
                </div>
            ` : ''}
        `;
        
        detailsSection.appendChild(archiveInfo);
    }
}

// Toggle booking felt på/af - for checkboxes med øjeblikkelig visuel feedback
async function toggleBookingField(bookingId, fieldName) {
    console.log(`Toggle ${fieldName} for booking ${bookingId}`);
    
    // Find det specifikke badge element for øjeblikkelig visuel feedback
    const bookingCard = document.querySelector(`[data-booking-id="${bookingId}"]`);
    const badgeElement = bookingCard?.querySelector(`[onclick*="toggleBookingField(${bookingId}, '${fieldName}')"]`);
    
    try {
        // Øjeblikkelig visuel feedback - tilføj loading state
        if (badgeElement) {
            badgeElement.style.opacity = '0.6';
            badgeElement.style.pointerEvents = 'none';
            console.log(`Visuel feedback aktiveret for ${fieldName} badge`);
        }
        
        // Hent nuværende booking data
        const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
        const bookingData = await bookingResponse.json();
        
        if (!bookingData.success || !bookingData.data) {
            throw new Error('Kunne ikke hente booking data - booking findes muligvis ikke');
        }
        
        const booking = bookingData.data;
        
        // Tjek at booking faktisk har data
        if (!booking || typeof booking !== 'object') {
            throw new Error('Booking data er ikke gyldig');
        }
        
        // Toggle værdien
        const currentValue = booking[fieldName] ? 1 : 0;
        const newValue = currentValue ? 0 : 1;
        console.log(`Toggler ${fieldName} fra ${currentValue} til ${newValue}`);
        
        // Opdater booking - sikrer at alle påkrævede felter er med
        const updateData = {
            ...booking,
            [fieldName]: newValue
        };
        
        const updateResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await updateResponse.json();
        
        if (result.success) {
            console.log(`${fieldName} opdateret for booking ${bookingId} - database opdateret`);
            
            // Opdater badge øjeblikkelig i stedet for at genindlæse alt
            if (badgeElement) {
                updateBadgeVisual(badgeElement, fieldName, newValue);
                badgeElement.style.opacity = '1';
                badgeElement.style.pointerEvents = 'auto';
            }
            
            // Vis subtil success feedback uden popup
            showQuietSuccess(`${getFieldDisplayName(fieldName)} ${newValue ? 'aktiveret' : 'deaktiveret'}`);
            
        } else {
            throw new Error(result.error || 'Fejl ved opdatering');
        }
        
    } catch (error) {
        console.error('Fejl ved toggle af felt:', error);
        
        // Gendan visuel state ved fejl
        if (badgeElement) {
            badgeElement.style.opacity = '1';
            badgeElement.style.pointerEvents = 'auto';
        }
        
        showError('Fejl ved opdatering af felt: ' + error.message);
    }
}

// Hjælpefunktion til at opdatere badge visuelt uden at genindlæse siden
function updateBadgeVisual(badgeElement, fieldName, newValue) {
    console.log(`Opdaterer visuel tilstand for ${fieldName} badge til ${newValue}`);
    
    const displayName = getFieldDisplayName(fieldName);
    
    if (newValue) {
        // Aktiveret tilstand
        badgeElement.className = 'confirmation-badge confirmed';
        badgeElement.textContent = `${displayName} ✓`;
        console.log(`Badge visuelt aktiveret: ${displayName}`);
    } else {
        // Deaktiveret tilstand
        badgeElement.className = 'confirmation-badge';
        badgeElement.textContent = displayName;
        console.log(`Badge visuelt deaktiveret: ${displayName}`);
    }
}

// Hjælpefunktion til at få det rigtige display navn for felter
function getFieldDisplayName(fieldName) {
    const fieldNames = {
        'title': 'Titel',
        'client_name': 'Klient Navn',
        'email': 'Email',
        'film_title': 'Film Titel',
        'catering_details': 'Forplejning Detaljer',
        'tech_details': 'Teknik Detaljer',
        'arrangement_price': 'Arrangement Pris',
        'price_confirmed': 'Pris Bekræftet',
        'participant_count': 'Antal Deltagere',
        'time_confirmed': 'Tid',
        'own_room': 'Egen sal', 
        'foyer_required': 'Foyer',
        'ticket_price_sent': 'Billetpris sendt',
        'extra_staff': 'Personale',
        'staff_informed': 'Info',
        'tickets_reserved': 'Billetter',
        'terms_written': 'Betingelser',
        'on_special_list': 'Særliste'
    };
    
    return fieldNames[fieldName] || fieldName;
}

// Hjælpefunktion til subtil success feedback uden popup
function showQuietSuccess(message) {
    console.log(`Quiet success: ${message}`);
    
    // Opret subtil toast notification i stedet for modal
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color, #22c55e);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animer ind
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Animer ud efter 2 sekunder
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// Rediger booking felt - for tekst/tal input
async function editBookingField(bookingId, fieldName) {
    console.log(`Rediger ${fieldName} for booking ${bookingId}`);
    
    try {
        // Hent nuværende booking data
        const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
        const bookingData = await bookingResponse.json();
        
        if (!bookingData.success || !bookingData.data) {
            throw new Error('Kunne ikke hente booking data - booking findes muligvis ikke');
        }
        
        const booking = bookingData.data;
        
        // Tjek at booking faktisk har data
        if (!booking || typeof booking !== 'object') {
            throw new Error('Booking data er ikke gyldig');
        }
        
        const currentValue = booking[fieldName] || '';
        
        // Vis input dialog baseret på felt type
        let newValue;
        if (fieldName === 'arrangement_price') {
            // Pris modal
            createPriceEditModal(booking, currentValue, (price) => {
                if (price !== null) {
                    const updateData = { ...booking, [fieldName]: price };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        } else if (fieldName === 'film_title') {
            // Film titel modal
            createTextEditModal('Film', 'Indtast filmtitel', currentValue, (title) => {
                if (title !== null) {
                    const updateData = { 
                        ...booking, 
                        [fieldName]: title,
                        film_confirmed: title && title.trim() ? 1 : 0
                    };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        } else if (fieldName === 'catering_details') {
            // Forplejning modal
            createTextEditModal('Forplejning', 'Beskriv forplejning detaljer', currentValue, (details) => {
                if (details !== null) {
                    const updateData = { 
                        ...booking, 
                        [fieldName]: details,
                        catering_required: details && details.trim() ? 1 : 0
                    };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        } else if (fieldName === 'tech_details') {
            // Teknik modal
            createTextEditModal('Teknik', 'Beskriv teknik behov', currentValue, (details) => {
                if (details !== null) {
                    const updateData = { 
                        ...booking, 
                        [fieldName]: details,
                        tech_required: details && details.trim() ? 1 : 0
                    };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        } else if (fieldName === 'title') {
            // Titel modal
            createTextEditModal('Titel', 'Indtast booking titel', currentValue, (title) => {
                if (title !== null) {
                    const updateData = { ...booking, [fieldName]: title };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        } else {
            // Generisk tekst modal for andre felter
            const fieldDisplayName = getFieldDisplayName(fieldName) || fieldName;
            createTextEditModal(fieldDisplayName, `Indtast ${fieldDisplayName.toLowerCase()}`, currentValue, (value) => {
                if (value !== null) {
                    const updateData = { ...booking, [fieldName]: value };
                    updateBookingField(bookingId, updateData, fieldName);
                }
            });
            return;
        }
        
        // Denne del skal ikke længere nås da alle felter har modaler
        console.log('Uventet: Ingen modal defineret for felt:', fieldName);
        
    } catch (error) {
        console.error('Fejl ved redigering af felt:', error);
        showError('Fejl ved opdatering af felt: ' + error.message);
    }
}

// Hjælpefunktion til at opdatere booking felt
async function updateBookingField(bookingId, updateData, fieldName) {
    try {
        const updateResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await updateResponse.json();
        
        if (result.success) {
            console.log(`${fieldName} opdateret for booking ${bookingId} - database opdateret`);
            // Genindlæs booking data for at opdatere visningen
            await loadBookingsData();
            showQuietSuccess(`${getFieldDisplayName(fieldName)} blev opdateret succesfuldt`);
        } else {
            throw new Error(result.error || 'Fejl ved opdatering');
        }
        
    } catch (error) {
        console.error('Fejl ved opdatering:', error);
        showError('Fejl ved opdatering: ' + error.message);
    }
}

// Opretter pæn modal til prisredigering
function createPriceEditModal(booking, currentValue, callback) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center;
        align-items: center; z-index: 1000; animation: modalFadeIn 0.3s ease-out;
        backdrop-filter: blur(3px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--card-bg, #2a3441); border-radius: 16px; padding: 28px;
        width: 380px; max-width: 90vw; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        color: var(--text-primary, #e2e8f0); animation: modalSlideIn 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom: 24px; text-align: center;">
            <div style="
                width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center;
                justify-content: center; font-size: 24px;
            ">💰</div>
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">Rediger Pris</h3>
            <p style="margin: 8px 0 0 0; color: var(--text-secondary, #94a3b8); font-size: 0.9rem;">
                ${escapeHtml(booking.client_name)} - ${formatDate(booking.booking_date)}
            </p>
        </div>
        
        <div style="margin-bottom: 28px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary, #e2e8f0);">
                💲 Arrangement Pris (DKK)
            </label>
            <input 
                type="number" 
                id="priceInput" 
                value="${currentValue || ''}"
                placeholder="0.00"
                step="0.01"
                min="0"
                style="
                    width: 100%; padding: 14px 16px; border: 2px solid var(--border-color, #475569);
                    border-radius: 10px; background: var(--input-bg, #334155);
                    color: var(--text-primary, #e2e8f0); font-size: 16px; font-weight: 500;
                    transition: all 0.2s; outline: none;
                "
            />
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelPriceBtn" style="
                padding: 12px 24px; border: 2px solid var(--border-color, #475569);
                border-radius: 10px; background: transparent; color: var(--text-secondary, #94a3b8);
                cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 14px;
            ">✕ Annuller</button>
            <button id="savePriceBtn" style="
                padding: 12px 24px; border: none; border-radius: 10px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white;
                cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 14px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            ">💾 Gem Pris</button>
        </div>
    `;
    
    // Tilføj forbedrede CSS animationer
    addModalStyles();
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    const priceInput = modal.querySelector('#priceInput');
    const cancelBtn = modal.querySelector('#cancelPriceBtn');
    const saveBtn = modal.querySelector('#savePriceBtn');
    
    // Forbedrede event listeners
    cancelBtn.onclick = () => {
        closeModalWithAnimation(modalOverlay, callback, null);
    };
    
    saveBtn.onclick = () => {
        const price = parseFloat(priceInput.value) || 0;
        closeModalWithAnimation(modalOverlay, callback, price);
    };
    
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            closeModalWithAnimation(modalOverlay, callback, null);
        }
    };
    
    // Enter key submit
    priceInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    };
    
    // Focus styling
    priceInput.onfocus = () => {
        priceInput.style.borderColor = 'var(--primary-color, #3b82f6)';
        priceInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    };
    
    priceInput.onblur = () => {
        priceInput.style.borderColor = 'var(--border-color, #475569)';
        priceInput.style.boxShadow = 'none';
    };
    
    // Focus på input efter animation
    setTimeout(() => {
        priceInput.focus();
        priceInput.select();
    }, 150);
}

// Opretter pæn modal til tekstredigering
function createTextEditModal(title, placeholder, currentValue, callback) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center;
        align-items: center; z-index: 1000; animation: modalFadeIn 0.3s ease-out;
        backdrop-filter: blur(3px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--card-bg, #2a3441); border-radius: 16px; padding: 28px;
        width: 420px; max-width: 90vw; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        color: var(--text-primary, #e2e8f0); animation: modalSlideIn 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Vælg passende emoji baseret på titel
    const getIconForTitle = (title) => {
        const icons = {
            'Film': '🎬',
            'Forplejning': '🍽️',
            'Teknik': '⚙️',
            'Titel': '📝',
            'Beskrivelse': '📄'
        };
        return icons[title] || '✏️';
    };
    
    modal.innerHTML = `
        <div style="margin-bottom: 24px; text-align: center;">
            <div style="
                width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center;
                justify-content: center; font-size: 24px;
            ">${getIconForTitle(title)}</div>
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">Rediger ${title}</h3>
        </div>
        
        <div style="margin-bottom: 28px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary, #e2e8f0);">
                ${getIconForTitle(title)} ${title} Detaljer
            </label>
            <textarea 
                id="textInput" 
                placeholder="${placeholder}"
                rows="4"
                style="
                    width: 100%; padding: 14px 16px; border: 2px solid var(--border-color, #475569);
                    border-radius: 10px; background: var(--input-bg, #334155);
                    color: var(--text-primary, #e2e8f0); font-size: 14px; resize: vertical;
                    font-family: inherit; transition: all 0.2s; outline: none; min-height: 100px;
                "
            >${currentValue || ''}</textarea>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelTextBtn" style="
                padding: 12px 24px; border: 2px solid var(--border-color, #475569);
                border-radius: 10px; background: transparent; color: var(--text-secondary, #94a3b8);
                cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 14px;
            ">✕ Annuller</button>
            <button id="saveTextBtn" style="
                padding: 12px 24px; border: none; border-radius: 10px;
                background: linear-gradient(135deg, #10b981, #059669); color: white;
                cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 14px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            ">💾 Gem</button>
        </div>
    `;
    
    addModalStyles();
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    const textInput = modal.querySelector('#textInput');
    const cancelBtn = modal.querySelector('#cancelTextBtn');
    const saveBtn = modal.querySelector('#saveTextBtn');
    
    // Event listeners
    cancelBtn.onclick = () => {
        closeModalWithAnimation(modalOverlay, callback, null);
    };
    
    saveBtn.onclick = () => {
        const value = textInput.value.trim();
        closeModalWithAnimation(modalOverlay, callback, value);
    };
    
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            closeModalWithAnimation(modalOverlay, callback, null);
        }
    };
    
    // Focus styling
    textInput.onfocus = () => {
        textInput.style.borderColor = 'var(--primary-color, #10b981)';
        textInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
    };
    
    textInput.onblur = () => {
        textInput.style.borderColor = 'var(--border-color, #475569)';
        textInput.style.boxShadow = 'none';
    };
    
    // Focus på input efter animation
    setTimeout(() => {
        textInput.focus();
        textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    }, 150);
}

// Hjælpefunktion til at lukke modal med animation
function closeModalWithAnimation(modalOverlay, callback, ...args) {
    modalOverlay.style.animation = 'modalFadeOut 0.2s ease-in forwards';
    const modal = modalOverlay.querySelector('div');
    modal.style.animation = 'modalSlideOut 0.2s ease-in forwards';
    
    setTimeout(() => {
        document.body.removeChild(modalOverlay);
        if (callback && typeof callback === 'function') {
            callback(...args);
        }
    }, 200);
}

// Tilføjer CSS animationer og styling
function addModalStyles() {
    if (document.getElementById('modalStyles')) return; // Undgå duplikering
    
    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modalFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes modalSlideIn {
            from { transform: translateY(-30px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes modalSlideOut {
            from { transform: translateY(0) scale(1); opacity: 1; }
            to { transform: translateY(-30px) scale(0.9); opacity: 0; }
        }
        .modal-overlay button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
        }
        .modal-overlay button:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

// Rediger booking tid (start og slut) - åbner dialog for tidsinput
async function editBookingTime(bookingId) {
    console.log(`Rediger tidsinterval for booking ${bookingId}`);
    try {
        const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
        const bookingData = await bookingResponse.json();
        if (!bookingData.success || !bookingData.data) {
            throw new Error('Kunne ikke hente booking data');
        }
        const booking = bookingData.data;
        
        // Opretter modal for tidsredigering
        createTimeEditModal(booking, async (startTime, endTime) => {
            const updateData = {
                ...booking,
                start_time: startTime,
                end_time: endTime,
                time_confirmed: 1 // Markér som bekræftet når tider ændres
            };
            
            const updateResponse = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            const result = await updateResponse.json();
            if (result.success) {
                console.log(`Tidsinterval opdateret for booking ${bookingId}`);
                await loadBookingsData();
                showSuccess('Tidsinterval opdateret');
            } else {
                throw new Error(result.error || 'Fejl ved opdatering');
            }
        });
        
    } catch (error) {
        console.error('Fejl ved redigering af tid:', error);
        showError('Fejl ved opdatering af tid: ' + error.message);
    }
}

// Opretter en pæn modal til tidsredigering
function createTimeEditModal(booking, callback) {
    // Opretter modal struktur
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: modalFadeIn 0.3s ease-out;
        backdrop-filter: blur(3px);
    `;
    
    const modal = document.createElement('div');
    modal.className = 'time-edit-modal';
    modal.style.cssText = `
        background: var(--card-bg, #2a3441);
        border-radius: 16px;
        padding: 28px;
        width: 420px;
        max-width: 90vw;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        color: var(--text-primary, #e2e8f0);
        animation: modalSlideIn 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Modal indhold
    modal.innerHTML = `
        <div style="margin-bottom: 24px; text-align: center;">
            <div style="
                width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706);
                border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center;
                justify-content: center; font-size: 24px;
            ">⏰</div>
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600; color: var(--text-primary, #e2e8f0);">
                Rediger Tidsinterval
            </h3>
            <p style="margin: 8px 0 0 0; color: var(--text-secondary, #94a3b8); font-size: 0.9rem;">
                ${escapeHtml(booking.client_name)} - ${formatDate(booking.booking_date)}
            </p>
        </div>
        
        <div style="display: grid; gap: 20px; margin-bottom: 28px;">
            <div class="input-group">
                <label for="startTimeInput" style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary, #e2e8f0);">
                    🕐 Starttid
                </label>
                <input 
                    type="time" 
                    id="startTimeInput" 
                    value="${booking.start_time || ''}"
                    style="
                        width: 100%;
                        padding: 14px 16px;
                        border: 2px solid var(--border-color, #475569);
                        border-radius: 10px;
                        background: var(--input-bg, #334155);
                        color: var(--text-primary, #e2e8f0);
                        font-size: 16px;
                        font-weight: 500;
                        transition: all 0.2s;
                        outline: none;
                    "
                />
            </div>
            
            <div class="input-group">
                <label for="endTimeInput" style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary, #e2e8f0);">
                    🕐 Sluttid
                </label>
                <input 
                    type="time" 
                    id="endTimeInput" 
                    value="${booking.end_time || ''}"
                    style="
                        width: 100%;
                        padding: 14px 16px;
                        border: 2px solid var(--border-color, #475569);
                        border-radius: 10px;
                        background: var(--input-bg, #334155);
                        color: var(--text-primary, #e2e8f0);
                        font-size: 16px;
                        font-weight: 500;
                        transition: all 0.2s;
                        outline: none;
                    "
                />
            </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button 
                type="button" 
                id="cancelTimeBtn"
                style="
                    padding: 12px 24px;
                    border: 2px solid var(--border-color, #475569);
                    border-radius: 10px;
                    background: transparent;
                    color: var(--text-secondary, #94a3b8);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    font-weight: 500;
                "
            >
                ✕ Annuller
            </button>
            <button 
                type="button" 
                id="saveTimeBtn"
                style="
                    padding: 12px 24px;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                "
            >
                💾 Gem Tider
            </button>
        </div>
    `;
    
    // Tilføjer CSS animationer
    addModalStyles();
    
    modalOverlay.appendChild(modal);
    
    // Event listeners
    const startTimeInput = modal.querySelector('#startTimeInput');
    const endTimeInput = modal.querySelector('#endTimeInput');
    const cancelBtn = modal.querySelector('#cancelTimeBtn');
    const saveBtn = modal.querySelector('#saveTimeBtn');
    
    // Focus styling for time inputs
    [startTimeInput, endTimeInput].forEach(input => {
        input.onfocus = () => {
            input.style.borderColor = 'var(--primary-color, #f59e0b)';
            input.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
        };
        
        input.onblur = () => {
            input.style.borderColor = 'var(--border-color, #475569)';
            input.style.boxShadow = 'none';
        };
    });
    
    // Annuller knap
    cancelBtn.addEventListener('click', () => {
        closeModalWithAnimation(modalOverlay, () => {}, null);
    });
    
    // Gem knap
    saveBtn.addEventListener('click', () => {
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        
        // Validering
        if (!startTime || !endTime) {
            showError('Begge tider skal angives');
            return;
        }
        
        if (startTime >= endTime) {
            showError('Starttid skal være før sluttid');
            return;
        }
        
        // Luk modal og kald callback
        closeModalWithAnimation(modalOverlay, callback, startTime, endTime);
    });
    
    // Luk ved klik uden for modal
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModalWithAnimation(modalOverlay, () => {}, null);
        }
    });
    
    // ESC tast luk
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModalWithAnimation(modalOverlay, () => {}, null);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Vis modal
    document.body.appendChild(modalOverlay);
    
    // Fokuser på første input efter kort delay
    setTimeout(() => {
        startTimeInput.focus();
    }, 150);
}

console.log('Booking funktioner indlæst og klar'); 