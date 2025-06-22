// Nordisk Film - Edit Booking JavaScript
console.log('Edit-booking.js indlæst - Edit funktionalitet tilgængelig');

// Globale variabler
let currentBookingId = null;
let originalBookingData = null;

// Initialisering når DOM er indlæst
document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit booking side initialiseres');
    initializeEditBookingForm();
});

// Hovedfunktion til initialisering af edit booking form
async function initializeEditBookingForm() {
    console.log('Initialiserer edit booking form');
    
    // Henter booking ID fra URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    currentBookingId = urlParams.get('id');
    
    if (!currentBookingId) {
        console.error('Ingen booking ID fundet i URL');
        showError('Ingen booking ID specificeret. Redirecter til dashboard.');
        setTimeout(() => {
            window.location.href = '/html/index.html';
        }, 2000);
        return;
    }
    
    console.log(`Indlæser booking med ID: ${currentBookingId}`);
    
    // Indlæs booking data
    await loadBookingData();
    
    // Sætter event listeners
    setupFormEventListeners();
    
    // Sætter initial visibility for conditional fields
    setupConditionalFields();
    
    // Sætter form validation
    setupFormValidation();
    
    console.log('Edit booking form initialiseret');
}

// Indlæser booking data fra API
async function loadBookingData() {
    console.log(`Henter booking data for ID: ${currentBookingId}`);
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const formContainer = document.getElementById('formContainer');
    
    try {
        // Viser loading indicator
        loadingIndicator.style.display = 'block';
        formContainer.style.display = 'none';
        
        // Henter booking data fra API
        const result = await fetchBookingById(currentBookingId);
        
        if (result.success && result.data && result.data.booking) {
            originalBookingData = result.data.booking;
            console.log('Booking data hentet:', originalBookingData);
            
            // Udfylder formularen med data
            populateForm(originalBookingData);
            
            // Opdaterer side titel
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = `Rediger Booking: ${originalBookingData.title || originalBookingData.client_name}`;
            }
            
            // Skjuler loading og viser form
            loadingIndicator.style.display = 'none';
            formContainer.style.display = 'block';
            
        } else {
            console.error('Kunne ikke hente booking data:', result.error);
            showError('Kunne ikke hente booking data. Redirecter til dashboard.');
            setTimeout(() => {
                window.location.href = '/html/index.html';
            }, 2000);
        }
        
    } catch (error) {
        console.error('Fejl ved indlæsning af booking data:', error);
        showError('Fejl ved indlæsning af booking data. Tjek internetforbindelse.');
        loadingIndicator.style.display = 'none';
    }
}

// Udfylder formularen med booking data
function populateForm(booking) {
    console.log('Udfylder formular med booking data:', booking.title || booking.client_name);
    
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
    
    // Opdater conditional fields baseret på checkbox states
    updateConditionalFields();
    
    console.log('Formular udfyldt med booking data');
}

// Sætter event listeners for form
function setupFormEventListeners() {
    console.log('Sætter form event listeners');
    
    // Form submit handler
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form submit listener tilføjet');
    }
    
    // Conditional field listeners
    const filmConfirmedCheckbox = document.getElementById('film_confirmed');
    if (filmConfirmedCheckbox) {
        filmConfirmedCheckbox.addEventListener('change', handleFilmConfirmedChange);
    }
    
    const cateringRequiredCheckbox = document.getElementById('catering_required');
    if (cateringRequiredCheckbox) {
        cateringRequiredCheckbox.addEventListener('change', handleCateringRequiredChange);
    }
    
    console.log('Conditional field listeners tilføjet');
}

// Håndterer form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Edit booking form submitted');
    
    // Viser loading state
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Gemmer...';
    }
    
    try {
        // Samler form data
        const bookingData = collectFormData();
        console.log('Booking data samlet:', bookingData);
        
        // Validerer data
        const validationResult = validateBookingData(bookingData);
        if (!validationResult.valid) {
            showError('Udfyld venligt alle påkrævede felter: ' + validationResult.message);
            return;
        }
        
        // Opdaterer booking via API
        console.log('Opdaterer booking via API');
        const result = await updateBooking(currentBookingId, bookingData);
        
        if (result.success) {
            console.log('Booking opdateret succesfuldt:', result.data);
            showSuccess('Booking opdateret succesfuldt!');
            
            // Navigerer tilbage til dashboard efter kort delay
            setTimeout(() => {
                window.location.href = '/html/index.html';
            }, 1500);
        } else {
            console.error('API fejl ved booking opdatering:', result.error);
            showError('Fejl ved opdatering af booking: ' + (result.error || 'Ukendt fejl'));
        }
        
    } catch (error) {
        console.error('Fejl ved booking opdatering:', error);
        showError('Fejl ved opdatering af booking. Tjek din internetforbindelse og prøv igen.');
    } finally {
        // Gendan knap state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Gem Ændringer';
        }
    }
}

// Samler form data til API format
function collectFormData() {
    console.log('Samler form data');
    
    const form = document.getElementById('bookingForm');
    const formData = new FormData(form);
    const bookingData = {};
    
    // Konverterer FormData til objekt med korrekte typer
    for (let [key, value] of formData.entries()) {
        if (key === 'bookingId') continue; // Springer booking ID over
        
        if (value === 'on' || value === '1') {
            bookingData[key] = 1;
        } else if (value === '' || value === null || value === undefined) {
            bookingData[key] = null;
        } else if (key === 'participant_count' && value) {
            bookingData[key] = parseInt(value);
        } else {
            bookingData[key] = value;
        }
    }
    
    // Tilføjer ikke-checked checkboxes som 0
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked && checkbox.name !== 'bookingId') {
            bookingData[checkbox.name] = 0;
        }
    });
    
    console.log('Form data samlet:', Object.keys(bookingData).length, 'felter');
    return bookingData;
}

// Validerer booking data
function validateBookingData(data) {
    console.log('Validerer booking data');
    
    // Kun navn, email og dato er påkrævet - alle andre felter er valgfrie
    const requiredFields = [
        { field: 'client_name', name: 'Klient Navn' },
        { field: 'email', name: 'Email' },
        { field: 'booking_date', name: 'Booking Dato' }
    ];
    
    const missingFields = [];
    
    for (const { field, name } of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            missingFields.push(name);
        }
    }
    
    // Email validering
    if (data.email && !isValidEmail(data.email)) {
        missingFields.push('Gyldig Email');
    }
    
    if (missingFields.length > 0) {
        return {
            valid: false,
            message: missingFields.join(', ')
        };
    }
    
    console.log('Booking data valideret succesfuldt');
    return { valid: true };
}

// Sætter conditional fields visibility
function setupConditionalFields() {
    console.log('Sætter conditional fields');
    updateConditionalFields();
    console.log('Conditional fields sat op');
}

// Opdaterer conditional fields baseret på checkbox states
function updateConditionalFields() {
    const filmConfirmed = document.getElementById('film_confirmed').checked;
    const cateringRequired = document.getElementById('catering_required').checked;
    
    const filmTitleGroup = document.getElementById('filmTitleGroup');
    const cateringDetailsGroup = document.getElementById('cateringDetailsGroup');
    
    // Viser/skjuler film titel felt
    if (filmConfirmed) {
        filmTitleGroup.classList.remove('hidden');
        filmTitleGroup.classList.add('show');
    } else {
        filmTitleGroup.classList.add('hidden');
        filmTitleGroup.classList.remove('show');
    }
    
    // Viser/skjuler forplejning detaljer felt
    if (cateringRequired) {
        cateringDetailsGroup.classList.remove('hidden');
        cateringDetailsGroup.classList.add('show');
    } else {
        cateringDetailsGroup.classList.add('hidden');
        cateringDetailsGroup.classList.remove('show');
    }
}

// Håndterer film confirmed change
function handleFilmConfirmedChange(e) {
    console.log('Film confirmed changed:', e.target.checked);
    updateConditionalFields();
}

// Håndterer catering required change
function handleCateringRequiredChange(e) {
    console.log('Catering required changed:', e.target.checked);
    updateConditionalFields();
}

// Sætter form validation
function setupFormValidation() {
    console.log('Sætter form validering');
    
    const requiredFields = ['client_name', 'email', 'booking_date'];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(field);
            });
            
            field.addEventListener('input', function() {
                clearFieldError(field);
            });
        }
    });
    
    console.log('Form validering sat op');
}

// Validerer enkelt felt
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.id;
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Dette felt er påkrævet');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Indtast en gyldig email adresse');
        return false;
    }
    
    return true;
}

// Viser fejl for specifikt felt
function showFieldError(field, message) {
    const fieldGroup = field.closest('.form-group');
    if (fieldGroup) {
        field.classList.add('error');
        
        let errorElement = fieldGroup.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            fieldGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
}

// Rydder fejl for specifikt felt
function clearFieldError(field) {
    const fieldGroup = field.closest('.form-group');
    if (fieldGroup) {
        field.classList.remove('error');
        const errorElement = fieldGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// Viser success besked
function showSuccess(message) {
    showMessage(message, 'success');
}

// Viser fejl besked
function showError(message) {
    showMessage(message, 'error');
}

// Viser besked
function showMessage(message, type) {
    // Fjerner eksisterende beskeder
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Opretter ny besked
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Indsætter besked i toppen af siden
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
        pageContainer.insertBefore(messageElement, pageContainer.firstChild);
    }
    
    // Fjerner besked efter 5 sekunder
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
    
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Email validering
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

console.log('Edit booking funktioner defineret og klar til brug'); 