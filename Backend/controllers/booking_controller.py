"""
Nordisk Film Booking System - Booking Controller
Håndterer HTTP endpoints for booking operationer
"""

from flask import request, jsonify
import json

print("Booking Controller indlæst - HTTP endpoint funktioner tilgængeligt")

class BookingController:
    """Controller klasse til booking HTTP endpoints"""
    
    def __init__(self, booking_service):
        """Initialiserer controller med booking service dependency"""
        self.booking_service = booking_service
        print("BookingController initialiseret med booking service")
    
    def health_check(self):
        """Sundhedscheck endpoint - returnerer API status"""
        print("Health check endpoint kaldt")
        
        return jsonify({
            'message': 'Nordisk Film Booking System API',
            'status': 'running',
            'version': '1.0.0',
            'endpoints': {
                'GET /': 'Health check',
                'GET /api/bookings': 'Hent alle bookinger',
                'GET /api/bookings/active': 'Hent aktive bookinger',
                'GET /api/bookings/archived': 'Hent arkiverede bookinger',
                'GET /api/bookings/<id>': 'Hent specifik booking',
                'POST /api/bookings': 'Opret ny booking',
                'PUT /api/bookings/<id>': 'Opdater booking',
                'PUT /api/bookings/<id>/status': 'Opdater booking status',
                'PUT /api/bookings/<id>/archive': 'Arkiver booking'
            }
        }), 200
    
    def get_all_bookings(self):
        """Henter alle bookinger med oversigt og statistikker"""
        print("GET /api/bookings - Henter booking oversigt")
        
        try:
            # Kalder service for booking data
            result = self.booking_service.get_bookings_overview()
            print(f"Booking oversigt hentet - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 500
                
        except Exception as e:
            error_msg = f"Controller fejl i get_all_bookings: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def get_booking_by_id(self, booking_id):
        """Henter en specifik booking baseret på ID"""
        print(f"GET /api/bookings/{booking_id} - Henter specifik booking")
        
        try:
            # Validerer booking ID
            if not booking_id or not str(booking_id).isdigit():
                error_msg = "Ugyldigt booking ID"
                print(f"ID validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Kalder service for booking data
            result = self.booking_service.get_booking_by_id(int(booking_id))
            print(f"Booking hentning resultat - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 404
                
        except Exception as e:
            error_msg = f"Controller fejl i get_booking_by_id: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def update_booking(self, booking_id):
        """Opdaterer en eksisterende booking med alle data"""
        print(f"PUT /api/bookings/{booking_id} - Opdaterer booking")
        
        try:
            # Validerer booking ID
            if not booking_id or not str(booking_id).isdigit():
                error_msg = "Ugyldigt booking ID"
                print(f"ID validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Henter og validerer JSON data fra request
            booking_data = request.get_json()
            print(f"Modtaget opdatering data: {booking_data}")
            
            if not booking_data:
                error_msg = "Ingen booking data modtaget i request body"
                print(f"Request validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Kalder service for booking opdatering
            result = self.booking_service.update_booking(int(booking_id), booking_data)
            print(f"Booking opdatering resultat - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 400
                
        except json.JSONDecodeError as e:
            error_msg = f"Ugyldig JSON format: {str(e)}"
            print(f"JSON parse fejl: {error_msg}")
            return jsonify({'error': error_msg}), 400
            
        except Exception as e:
            error_msg = f"Controller fejl i update_booking: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def create_new_booking(self):
        """Opretter en ny booking baseret på JSON request data"""
        print("POST /api/bookings - Opretter ny booking")
        
        try:
            # Henter og validerer JSON data fra request
            booking_data = request.get_json()
            print(f"Modtaget booking data: {booking_data}")
            
            if not booking_data:
                error_msg = "Ingen booking data modtaget i request body"
                print(f"Request validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Validerer påkrævede felter
            # rolle: Input validering + begrundelse: Kun nødvendige felter (navn, email, dato) skal kræves for at oprette booking
            required_fields = ['client_name', 'email', 'booking_date']
            missing_fields = []
            
            for field in required_fields:
                if field not in booking_data or not booking_data[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                error_msg = f"Påkrævede felter mangler: {', '.join(missing_fields)}"
                print(f"Validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Kalder service for booking oprettelse
            result = self.booking_service.create_new_booking(booking_data)
            print(f"Booking oprettelse resultat - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 201
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 400
                
        except json.JSONDecodeError as e:
            error_msg = f"Ugyldig JSON format: {str(e)}"
            print(f"JSON parse fejl: {error_msg}")
            return jsonify({'error': error_msg}), 400
            
        except Exception as e:
            error_msg = f"Controller fejl i create_new_booking: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def update_booking_status(self, booking_id):
        """Opdaterer status på en eksisterende booking"""
        print(f"PUT /api/bookings/{booking_id}/status - Opdaterer booking status")
        
        try:
            # Validerer booking ID
            if not booking_id or not str(booking_id).isdigit():
                error_msg = "Ugyldigt booking ID"
                print(f"ID validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Henter JSON data med ny status
            status_data = request.get_json()
            print(f"Modtaget status data: {status_data}")
            
            if not status_data or 'status' not in status_data:
                error_msg = "Ny status ikke specificeret i request"
                print(f"Status validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            new_status = status_data['status']
            
            # Validerer status værdi
            valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
            if new_status not in valid_statuses:
                error_msg = f"Ugyldig status. Gyldige værdier: {', '.join(valid_statuses)}"
                print(f"Status validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Kalder service for status opdatering
            result = self.booking_service.update_booking_status(int(booking_id), new_status)
            print(f"Status opdatering resultat - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 400
                
        except json.JSONDecodeError as e:
            error_msg = f"Ugyldig JSON format: {str(e)}"
            print(f"JSON parse fejl: {error_msg}")
            return jsonify({'error': error_msg}), 400
            
        except Exception as e:
            error_msg = f"Controller fejl i update_booking_status: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500

    # Arkiv endpoints jf. ønsket funktionalitet fra sedel
    def get_active_bookings(self):
        """Henter kun aktive (ikke-arkiverede) bookinger"""
        print("GET /api/bookings/active - Henter aktive bookinger")
        
        try:
            # Kalder service for aktive booking data
            result = self.booking_service.get_active_bookings_overview()
            print(f"Aktive booking oversigt hentet - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 500
                
        except Exception as e:
            error_msg = f"Controller fejl i get_active_bookings: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def get_archived_bookings(self):
        """Henter arkiverede bookinger med faktura statistik"""
        print("GET /api/bookings/archived - Henter arkiverede bookinger")
        
        try:
            # Kalder service for arkiverede booking data
            result = self.booking_service.get_archived_bookings_overview()
            print(f"Arkiverede booking oversigt hentet - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 500
                
        except Exception as e:
            error_msg = f"Controller fejl i get_archived_bookings: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
    
    def archive_booking(self, booking_id):
        """Arkiverer en specifik booking manuelt"""
        print(f"PUT /api/bookings/{booking_id}/archive - Arkiverer booking")
        
        try:
            # Validerer booking ID
            if not booking_id or not str(booking_id).isdigit():
                error_msg = "Ugyldigt booking ID"
                print(f"ID validering fejl: {error_msg}")
                return jsonify({'error': error_msg}), 400
            
            # Kalder service for arkivering
            result = self.booking_service.archive_booking(int(booking_id))
            print(f"Booking arkivering resultat - Success: {result['success']}")
            
            if result['success']:
                return jsonify(result), 200
            else:
                print(f"Service fejl: {result['error']}")
                return jsonify({'error': result['error']}), 404
                
        except Exception as e:
            error_msg = f"Controller fejl i archive_booking: {str(e)}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500

print("BookingController klasse defineret og klar til brug") 