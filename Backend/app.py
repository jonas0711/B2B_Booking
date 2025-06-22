from flask import Flask, request, jsonify
from flask_cors import CORS
from services.booking_service import BookingService
from controllers.booking_controller import BookingController

# Initialiserer Flask applikationen med organiseret struktur
app = Flask(__name__)
# Aktiverer CORS for at tillade requests fra frontend
CORS(app)

print("Nordisk Film Booking System startet med organiseret struktur")
print("Initialiserer services og controllers...")

# Initialiserer service layer
booking_service = BookingService()
print("BookingService initialiseret")

# Initialiserer controller layer
booking_controller = BookingController(booking_service)
print("BookingController initialiseret")

print("API endpoints tilgængelige på port 5000")

# Sundhedscheck endpoint
@app.route('/')
def home():
    """Sundhedscheck endpoint via controller"""
    return booking_controller.health_check()

# Booking endpoints via controller
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    """Henter alle bookinger via controller"""
    return booking_controller.get_all_bookings()

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def get_booking_by_id(booking_id):
    """Henter specifik booking via controller"""
    return booking_controller.get_booking_by_id(booking_id)

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """Opretter ny booking via controller"""
    return booking_controller.create_new_booking()

@app.route('/api/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Opdaterer booking via controller"""
    return booking_controller.update_booking(booking_id)

@app.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    """Opdaterer booking status via controller"""
    return booking_controller.update_booking_status(booking_id)

# Arkiv endpoints jf. ønsket funktionalitet
@app.route('/api/bookings/active', methods=['GET'])
def get_active_bookings():
    """Henter kun aktive (ikke-arkiverede) bookinger"""
    return booking_controller.get_active_bookings()

@app.route('/api/bookings/archived', methods=['GET'])
def get_archived_bookings():
    """Henter arkiverede bookinger med faktura statistik"""
    return booking_controller.get_archived_bookings()

@app.route('/api/bookings/<int:booking_id>/archive', methods=['PUT'])
def archive_booking(booking_id):
    """Arkiverer en specifik booking"""
    return booking_controller.archive_booking(booking_id)

@app.errorhandler(404)
def not_found(error):
    """Handler for 404 errors"""
    print(f"404 fejl: {request.url}")
    return jsonify({'error': 'Endpoint ikke fundet'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler for 500 errors"""
    print(f"500 fejl: {str(error)}")
    return jsonify({'error': 'Intern server fejl'}), 500

if __name__ == '__main__':
    print("Starter Nordisk Film Booking System...")
    print("Backend kører på http://localhost:5000")
    print("Tilgængelige endpoints:")
    print("  GET  /api/bookings - Hent alle bookinger")
    print("  GET  /api/bookings/active - Hent aktive bookinger")
    print("  GET  /api/bookings/archived - Hent arkiverede bookinger")
    print("  GET  /api/bookings/<id> - Hent specifik booking")
    print("  POST /api/bookings - Opret ny booking") 
    print("  PUT  /api/bookings/<id> - Opdater booking")
    print("  PUT  /api/bookings/<id>/status - Opdater booking status")
    print("  PUT  /api/bookings/<id>/archive - Arkiver booking")
    
    # Starter Flask udviklingsserver
    app.run(debug=True, host='0.0.0.0', port=5000) 