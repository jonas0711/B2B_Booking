// Nordisk Film - Create Booking JavaScript
console.log('Create-booking.js indlæst - Form funktionalitet tilgængelig');

// Initialisering når DOM er indlæst
document.addEventListener('DOMContentLoaded', function() {
    console.log('Create booking side initialiseres');
    initializeCreateBookingForm();
});

// Hovedfunktion til initialisering af create booking form
function initializeCreateBookingForm() {
    console.log('Initialiserer create booking form');
    
    // Sætter event listeners
    setupFormEventListeners();
    
    // Sætter initial visibility for conditional fields
    setupConditionalFields();
    
    // Sætter form validation
    setupFormValidation();
    
    console.log('Create booking form initialiseret');
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
    console.log('Booking form submitted');
    
    // Viser loading state
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Opretter...';
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
        
        // Opretter booking via API
        console.log('Sender booking til API');
        const result = await createBooking(bookingData);
        
        if (result.success) {
            console.log('Booking oprettet succesfuldt:', result.data);
            showSuccess('Booking oprettet succesfuldt!');
            
            // Navigerer tilbage til dashboard efter kort delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            console.error('API fejl ved booking oprettelse:', result.error);
            showError('Fejl ved oprettelse af booking: ' + (result.error || 'Ukendt fejl'));
        }
        
    } catch (error) {
        console.error('Fejl ved booking oprettelse:', error);
        showError('Fejl ved oprettelse af booking. Tjek din internetforbindelse og prøv igen.');
    } finally {
        // Gendan knap state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Opret Booking';
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
        if (value === 'on' || value === '1') {
            bookingData[key] = true;
        } else if (value === '' || value === null || value === undefined) {
            bookingData[key] = null;
        } else if (key === 'participant_count' && value) {
            bookingData[key] = parseInt(value);
        } else if (key === 'arrangement_price' && value) {
            bookingData[key] = parseFloat(value);
        } else if (key === 'film_required' || key === 'catering_required' || key === 'tech_required') {
            bookingData[key] = parseInt(value);
        } else {
            bookingData[key] = value;
        }
    }
    
    // Sætter default status
    bookingData.status = 'pending';
    
    // Tilføjer timestamp
    bookingData.created_at = new Date().toISOString();
    
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
    
    // Skjul film title, catering details og tech details initially
    const filmTitleGroup = document.getElementById('filmTitleGroup');
    const cateringDetailsGroup = document.getElementById('cateringDetailsGroup');
    const techDetailsGroup = document.getElementById('techDetailsGroup');
    
    if (filmTitleGroup) {
        filmTitleGroup.style.display = 'none';
    }
    
    if (cateringDetailsGroup) {
        cateringDetailsGroup.style.display = 'none';
    }
    
    if (techDetailsGroup) {
        techDetailsGroup.style.display = 'none';
    }
    
    console.log('Conditional fields sat op');
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

// Sætter form validation
function setupFormValidation() {
    console.log('Sætter form validation');
    
    // Real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = 'var(--error)';
                showFieldError(this, 'Indtast en gyldig email adresse');
            } else {
                this.style.borderColor = '';
                clearFieldError(this);
            }
        });
    }
    
    // Date validation - ikke tidligere end i dag
    const bookingDateInput = document.getElementById('booking_date');
    if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.min = today;
        
        bookingDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            
            if (selectedDate < todayDate) {
                this.style.borderColor = 'var(--error)';
                showFieldError(this, 'Booking dato kan ikke være i fortiden');
            } else {
                this.style.borderColor = '';
                clearFieldError(this);
            }
        });
    }
    
    console.log('Form validation sat op');
}

// Viser field error
function showFieldError(field, message) {
    // Fjern eksisterende error
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--error)';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Fjerner field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Viser success besked
function showSuccess(message) {
    showMessage(message, 'success');
}

// Viser error besked
function showError(message) {
    showMessage(message, 'error');
}

// Viser besked
function showMessage(message, type) {
    // Fjern eksisterende beskeder
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type === 'success' ? 'success-message' : 'error-message'}`;
    messageDiv.textContent = message;
    
    // Indsæt besked øverst i form container
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.insertBefore(messageDiv, formContainer.firstChild);
        
        // Auto-fjern efter 5 sekunder
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
        
        // Scroll til besked
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

console.log('Create-booking funktionalitet indlæst og klar'); 