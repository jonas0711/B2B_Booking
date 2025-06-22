const express = require('express');
const path = require('path');

// Initialiserer Express applikationen
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Nordisk Film Booking Frontend Server starter...');
console.log('Opdateret til organiseret filstruktur');

// Middleware til at serve statiske filer fra forskellige mapper
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Debug middleware til at logge alle requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Hovedrute til dashboard - serverer HTML fra html mappen
app.get('/', (req, res) => {
    console.log('Sender organiseret index.html til klient');
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Alternativ rute til dashboard
app.get('/dashboard', (req, res) => {
    console.log('Dashboard rute - sender index.html');
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Rute til create-booking siden
app.get('/create-booking', (req, res) => {
    console.log('Create-booking rute - sender create-booking.html');
    res.sendFile(path.join(__dirname, 'html', 'create-booking.html'));
});

// Sundhedscheck endpoint
app.get('/health', (req, res) => {
    console.log('Health check endpoint kaldt');
    res.json({ 
        status: 'ok', 
        service: 'Nordisk Film Booking Frontend',
        timestamp: new Date().toISOString(),
        structure: 'Organiseret filstruktur'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    console.log('Frontend API status check');
    res.json({
        frontend: 'running',
        structure: {
            css: 'Frontend/css/',
            js: 'Frontend/js/',
            html: 'Frontend/html/',
            assets: 'Frontend/assets/'
        },
        backend_url: 'http://localhost:5000'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server fejl:', err.stack);
    res.status(500).json({
        error: 'Intern server fejl',
        message: 'Noget gik galt på frontend serveren'
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Fil ikke fundet: ${req.url}`);
    res.status(404).json({
        error: 'Side ikke fundet',
        requested_url: req.url,
        available_routes: ['/', '/dashboard', '/create-booking', '/health', '/api/status']
    });
});

// Starter serveren
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     Nordisk Film Frontend Server Startet    ║');
    console.log('║                                              ║');
    console.log(`║  Port: ${PORT}                                ║`);
    console.log(`║  URL: http://localhost:${PORT}                ║`);
    console.log('║                                              ║');
    console.log('║  Organiseret filstruktur:                    ║');
    console.log('║  📁 Frontend/                                ║');
    console.log('║    📁 css/     - Styling filer               ║');
    console.log('║    📁 js/      - JavaScript filer            ║');
    console.log('║    📁 html/    - HTML templates              ║');
    console.log('║    📁 assets/  - Billeder & ressourcer       ║');
    console.log('║                                              ║');
    console.log('║  Backend forbindelse: http://localhost:5000 ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    
    console.log('Frontend server klar til at modtage requests');
    console.log('Statiske filer serveres fra organiserede mapper');
}); 