// Nordisk Film Booking System - Modal funktioner
console.log('Modal.js indlæst - Modal funktionalitet tilgængelig');

// Debug: Verificer at modal elementer er tilgængelige
document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal.js DOM loaded - tjekker modal elementer');
    const modal = document.getElementById('createModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const bookingForm = document.getElementById('bookingForm');
    
    console.log('Modal elementer fundet:', {
        modal: !!modal,
        modalTitle: !!modalTitle,
        submitBtn: !!submitBtn,
        bookingForm: !!bookingForm
    });
    
    // Verificer at openEditModal funktionen er tilgængelig globalt
    if (typeof openEditModal === 'function') {
        console.log('✓ openEditModal funktion er tilgængelig');
    } else {
        console.error('✗ openEditModal funktion IKKE tilgængelig');
    }
});

// Modal elementer
const modal = document.getElementById('createModal');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const bookingForm = document.getElementById('bookingForm');

// Globale variabler for modal tilstand
let isEditMode = false;
let currentBookingId = null;

// Åbner modal til oprettelse af ny booking
function openCreateModal() {
    console.log('Åbner modal til oprettelse af ny booking');
    
    isEditMode = false;
    currentBookingId = null;
    
    // Opdaterer modal titel og knap
    modalTitle.textContent = 'Opret Ny Booking';
    submitBtn.textContent = 'Opret Booking';
    
    // Rydder formularen
    clearForm();
    
    // Viser modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Fokuserer på første felt
    document.getElementById('title').focus();
}

// Åbner modal til redigering af eksisterende booking
async function openEditModal(bookingId) {
    console.log(`Åbner modal til redigering af booking ${bookingId}`);
    
    isEditMode = true;
    currentBookingId = bookingId;
    
    // Opdaterer modal titel og knap
    modalTitle.textContent = 'Rediger Booking';
    submitBtn.textContent = 'Gem Ændringer';
    
    // Henter booking data
    const result = await fetchBookingById(bookingId);
    
    if (result.success) {
        // Fylder formularen med eksisterende data
        populateForm(result.data.booking);
        updateDynamicFields();
        
        // Viser modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Fokuserer på første felt
        document.getElementById('title').focus();
    } else {
        console.error('Kunne ikke hente booking data til redigering');
    }
}

// Udfylder formularen med booking data
function populateForm(booking) {
    console.log('Udfylder formular med booking data:', booking.title);
    
    // Grundlæggende felter
    document.getElementById('bookingId').value = booking.id || '';
    document.getElementById('title').value = booking.title || '';
    document.getElementById('client_name').value = booking.client_name || '';
    document.getElementById('email').value = booking.email || '';
    document.getElementById('booking_date').value = booking.booking_date || '';
    document.getElementById('start_time').value = booking.start_time || '';
    document.getElementById('end_time').value = booking.end_time || '';
    document.getElementById('description').value = booking.description || '';
    
    // Dato felter
    document.getElementById('mail_received_date').value = booking.mail_received_date || '';
    document.getElementById('last_mail_sent_date').value = booking.last_mail_sent_date || '';
    
    // Numeriske felter
    document.getElementById('participant_count').value = booking.participant_count || '';
    
    // Tekst felter
    document.getElementById('film_title').value = booking.film_title || '';
    document.getElementById('catering_details').value = booking.catering_details || '';
    
    // Checkbox felter - konverterer 1/0 til boolean
    document.getElementById('time_confirmed').checked = Boolean(booking.time_confirmed);
    document.getElementById('film_confirmed').checked = Boolean(booking.film_confirmed);
    document.getElementById('catering_required').checked = Boolean(booking.catering_required);
    document.getElementById('own_room').checked = Boolean(booking.own_room);
    document.getElementById('foyer_required').checked = Boolean(booking.foyer_required);
    document.getElementById('tech_required').checked = Boolean(booking.tech_required);
    document.getElementById('price_confirmed').checked = Boolean(booking.price_confirmed);
    document.getElementById('ticket_price_sent').checked = Boolean(booking.ticket_price_sent);
    document.getElementById('extra_staff').checked = Boolean(booking.extra_staff);
    document.getElementById('staff_informed').checked = Boolean(booking.staff_informed);
    document.getElementById('tickets_reserved').checked = Boolean(booking.tickets_reserved);
    document.getElementById('terms_written').checked = Boolean(booking.terms_written);
    document.getElementById('on_special_list').checked = Boolean(booking.on_special_list);
}

// Rydder alle formular felter
function clearForm() {
    console.log('Rydder booking formular');
    
    // Rydder alle input felter
    const inputs = bookingForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Skjuler dynamiske felter
    updateDynamicFields();
}

// Opdaterer synlighed af dynamiske felter baseret på checkbox state
function updateDynamicFields() {
    const filmConfirmed = document.getElementById('film_confirmed').checked;
    const cateringRequired = document.getElementById('catering_required').checked;
    
    const filmTitleGroup = document.getElementById('filmTitleGroup');
    const cateringDetailsGroup = document.getElementById('cateringDetailsGroup');
    
    // Viser/skjuler film titel felt
    if (filmConfirmed) {
        filmTitleGroup.classList.add('show');
    } else {
        filmTitleGroup.classList.remove('show');
        document.getElementById('film_title').value = '';
    }
    
    // Viser/skjuler forplejning detaljer felt
    if (cateringRequired) {
        cateringDetailsGroup.classList.add('show');
    } else {
        cateringDetailsGroup.classList.remove('show');
        document.getElementById('catering_details').value = '';
    }
}

// Samler alle formular data
function getFormData() {
    const formData = new FormData(bookingForm);
    const data = {};
    
    // Konverterer form data til objekt
    for (const [key, value] of formData.entries()) {
        if (key === 'bookingId') continue; // Springer booking ID over
        
        // Håndterer checkbox værdier
        if (bookingForm.querySelector(`[name="${key}"]`)?.type === 'checkbox') {
            data[key] = value === '1' ? 1 : 0;
        } else {
            data[key] = value || null;
        }
    }
    
    // Tilføjer ikke-checked checkboxes som 0
    const checkboxes = bookingForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked && checkbox.name !== 'bookingId') {
            data[checkbox.name] = 0;
        }
    });
    
    console.log('Formular data samlet:', data);
    return data;
}

// Lukker modal og rydder tilstand
function closeCreateModal() {
    console.log('Lukker booking modal');
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Nulstiller tilstand
    isEditMode = false;
    currentBookingId = null;
    
    // Rydder formularen
    clearForm();
}

// Håndterer form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Håndterer formular indsendelse - Edit mode:', isEditMode);
    
    // Samle formular data
    const formData = getFormData();
    
    // Valider grundlæggende felter (kun hvis de er udfyldt)
    if (!formData.title && !formData.client_name && !formData.booking_date) {
        alert('Udfyld mindst titel, klient navn eller booking dato');
        return;
    }
    
    let result;
    
    if (isEditMode && currentBookingId) {
        // Opdater eksisterende booking
        result = await updateBooking(currentBookingId, formData);
    } else {
        // Opret ny booking
        result = await createBooking(formData);
    }
    
    if (result.success) {
        // Luk modal og genindlæs data
        closeCreateModal();
        await loadBookingsData();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Modal luk knapper
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCreateModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCreateModal);
    }
    
    // Klik uden for modal lukker den
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeCreateModal();
        }
    });
    
    // Escape tast lukker modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeCreateModal();
        }
    });
    
    // Form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Checkbox listeners for dynamiske felter
    const filmConfirmedCheckbox = document.getElementById('film_confirmed');
    const cateringRequiredCheckbox = document.getElementById('catering_required');
    
    if (filmConfirmedCheckbox) {
        filmConfirmedCheckbox.addEventListener('change', updateDynamicFields);
    }
    
    if (cateringRequiredCheckbox) {
        cateringRequiredCheckbox.addEventListener('change', updateDynamicFields);
    }
    
    console.log('Modal event listeners oprettet');
});

console.log('Modal funktioner defineret og klar til brug'); 