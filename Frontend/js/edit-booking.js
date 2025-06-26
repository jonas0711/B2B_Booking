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
            window.location.href = '/';
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
        
        if (result.success && result.data) {
            // Backend returnerer booking data direkte i result.data, ikke result.data.booking
            originalBookingData = result.data;
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
                window.location.href = '/';
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
    
    // Hjælpe funktion til sikker element opdatering
    const setValueSafely = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        } else {
            console.warn(`Input element ikke fundet: ${id}`);
        }
    };
    
    // Grundlæggende felter
    setValueSafely('bookingId', booking.id);
    setValueSafely('title', booking.title);
    setValueSafely('client_name', booking.client_name);
    setValueSafely('email', booking.email);
    setValueSafely('cinema_location', booking.cinema_location || 'Kennedy');
    setValueSafely('status', booking.status || 'pending');
    setValueSafely('booking_date', booking.booking_date);
    setValueSafely('start_time', booking.start_time);
    setValueSafely('end_time', booking.end_time);
    setValueSafely('description', booking.description);
    
    // Dato felter
    setValueSafely('mail_received_date', booking.mail_received_date);
    setValueSafely('last_mail_sent_date', booking.last_mail_sent_date);
    
    // Numeriske felter
    setValueSafely('participant_count', booking.participant_count);
    
    // Tekst felter
    setValueSafely('film_title', booking.film_title);
    setValueSafely('catering_details', booking.catering_details);
    setValueSafely('tech_details', booking.tech_details);
    
    // Ny struktur for film, forplejning og teknik - matcher backend field navne
    setValueSafely('film_required', booking.film_confirmed ? '1' : (booking.film_title ? '1' : '0'));
    setValueSafely('catering_required', booking.catering_required ? '1' : (booking.catering_details ? '1' : '0'));
    setValueSafely('tech_required', booking.tech_required ? '1' : (booking.tech_details ? '1' : '0'));
    
    // Pris som input felt
    setValueSafely('arrangement_price', booking.arrangement_price);
    
    // Checkbox felter - konverterer 1/0 til boolean med error handling
    const setCheckboxSafely = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = Boolean(value);
        } else {
            console.warn(`Checkbox element ikke fundet: ${id}`);
        }
    };
    
    setCheckboxSafely('time_confirmed', booking.time_confirmed);
    setCheckboxSafely('price_confirmed', booking.price_confirmed);
    setCheckboxSafely('own_room', booking.own_room);
    setCheckboxSafely('foyer_required', booking.foyer_required);
    setCheckboxSafely('ticket_price_sent', booking.ticket_price_sent);
    setCheckboxSafely('extra_staff', booking.extra_staff);
    setCheckboxSafely('staff_informed', booking.staff_informed);
    setCheckboxSafely('tickets_reserved', booking.tickets_reserved);
    setCheckboxSafely('terms_written', booking.terms_written);
    setCheckboxSafely('on_special_list', booking.on_special_list);
    
    // Arkiv felter jf. ønsket funktionalitet
    if (booking.is_archived || booking.invoice_sent || booking.invoice_file_path || booking.revenue_analysis) {
        // Vis arkiv sektion hvis der er arkiv data
        const archiveSection = document.getElementById('archiveSection');
        if (archiveSection) {
            archiveSection.style.display = 'block';
        }
        
        document.getElementById('is_archived').checked = Boolean(booking.is_archived);
        document.getElementById('invoice_sent').checked = Boolean(booking.invoice_sent);
        document.getElementById('invoice_file_path').value = booking.invoice_file_path || '';
        document.getElementById('revenue_analysis').value = booking.revenue_analysis || '';
    }
    
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
    
    // Conditional field listeners for new structure
    const filmRequiredSelect = document.getElementById('film_required');
    if (filmRequiredSelect) {
        filmRequiredSelect.addEventListener('change', handleFilmRequiredChange);
    }
    
    const cateringRequiredSelect = document.getElementById('catering_required');
    if (cateringRequiredSelect) {
        cateringRequiredSelect.addEventListener('change', handleCateringRequiredChange);
    }
    
    const techRequiredSelect = document.getElementById('tech_required');
    if (techRequiredSelect) {
        techRequiredSelect.addEventListener('change', handleTechRequiredChange);
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
                window.location.href = '/';
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
        
        // rolle: Mapper frontend select navne til korrekte database felter
        // begrundelse: Frontend bruger _required navne men database bruger _confirmed og _required
        if (key === 'film_required') {
            bookingData['film_confirmed'] = value === '1' ? 1 : 0;
            continue;
        }
        
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

// Opdaterer conditional fields baseret på select states
function updateConditionalFields() {
    console.log('Opdaterer conditional fields');
    
    // Film titel felt
    const filmRequired = document.getElementById('film_required').value;
    const filmTitleGroup = document.getElementById('filmTitleGroup');
    if (filmTitleGroup) {
        if (filmRequired === '1') {
            filmTitleGroup.style.display = 'block';
        } else {
            filmTitleGroup.style.display = 'none';
        }
    }
    
    // Forplejning detaljer felt
    const cateringRequired = document.getElementById('catering_required').value;
    const cateringDetailsGroup = document.getElementById('cateringDetailsGroup');
    if (cateringDetailsGroup) {
        if (cateringRequired === '1') {
            cateringDetailsGroup.style.display = 'block';
        } else {
            cateringDetailsGroup.style.display = 'none';
        }
    }
    
    // Teknik detaljer felt
    const techRequired = document.getElementById('tech_required').value;
    const techDetailsGroup = document.getElementById('techDetailsGroup');
    if (techDetailsGroup) {
        if (techRequired === '1') {
            techDetailsGroup.style.display = 'block';
        } else {
            techDetailsGroup.style.display = 'none';
        }
    }
    
    console.log('Conditional fields opdateret');
}

// Håndterer film required change
function handleFilmRequiredChange(e) {
    console.log('Film required changed:', e.target.value);
    
    const filmTitleGroup = document.getElementById('filmTitleGroup');
    if (filmTitleGroup) {
        if (e.target.value === '1') {
            filmTitleGroup.style.display = 'block';
        } else {
            filmTitleGroup.style.display = 'none';
            document.getElementById('film_title').value = '';
        }
    }
}

// Håndterer catering required change
function handleCateringRequiredChange(e) {
    console.log('Catering required changed:', e.target.value);
    
    const cateringDetailsGroup = document.getElementById('cateringDetailsGroup');
    if (cateringDetailsGroup) {
        if (e.target.value === '1') {
            cateringDetailsGroup.style.display = 'block';
        } else {
            cateringDetailsGroup.style.display = 'none';
            document.getElementById('catering_details').value = '';
        }
    }
}

// Håndterer tech required change
function handleTechRequiredChange(e) {
    console.log('Tech required changed:', e.target.value);
    
    const techDetailsGroup = document.getElementById('techDetailsGroup');
    if (techDetailsGroup) {
        if (e.target.value === '1') {
            techDetailsGroup.style.display = 'block';
        } else {
            techDetailsGroup.style.display = 'none';
            document.getElementById('tech_details').value = '';
        }
    }
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