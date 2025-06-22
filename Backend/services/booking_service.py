from models.database import BookingDatabase
from datetime import datetime
import json

# Business logic service for booking operationer
class BookingService:
    def __init__(self):
        """Initialiserer booking service med database forbindelse"""
        print("Initialiserer BookingService")
        self.db = BookingDatabase()
    
    def create_new_booking(self, booking_data):
        """Validerer og opretter en ny booking"""
        print(f"Behandler ny booking anmodning: {booking_data.get('title')}")
        
        # Validerer påkrævede felter - kun navn, email og dato er påkrævet
        required_fields = ['client_name', 'email', 'booking_date']
        missing_fields = [field for field in required_fields if not booking_data.get(field)]
        
        if missing_fields:
            error_msg = f"Påkrævede felter mangler: {', '.join(missing_fields)}"
            print(f"Validering fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Validerer dato format
        try:
            datetime.strptime(booking_data['booking_date'], '%Y-%m-%d')
        except ValueError:
            error_msg = "Ugyldig dato format. Brug YYYY-MM-DD"
            print(f"Dato validationsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Opretter booking i database
        try:
            booking_id = self.db.create_booking(booking_data)
            print(f"Booking succesfuldt oprettet med ID: {booking_id}")
            return {
                'success': True, 
                'booking_id': booking_id,
                'message': 'Booking oprettet succesfuldt'
            }
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved oprettelse: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def get_booking_by_id(self, booking_id):
        """Henter en specifik booking baseret på ID"""
        print(f"Henter booking med ID: {booking_id}")
        
        try:
            booking = self.db.get_booking_by_id(booking_id)
            if booking:
                print(f"Booking fundet: {booking['title']}")
                return {
                    'success': True,
                    'booking': booking
                }
            else:
                error_msg = f"Booking med ID {booking_id} ikke fundet"
                print(f"Booking ikke fundet: {error_msg}")
                return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved hentning: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def update_booking(self, booking_id, booking_data):
        """Opdaterer en eksisterende booking med alle data"""
        print(f"Opdaterer booking {booking_id}")
        
        # Validerer at booking eksisterer
        existing_booking = self.db.get_booking_by_id(booking_id)
        if not existing_booking:
            error_msg = f"Booking med ID {booking_id} ikke fundet"
            print(f"Opdateringsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Validerer påkrævede felter - kun navn, email og dato er påkrævet ved opdatering
        required_fields = ['client_name', 'email', 'booking_date']  
        missing_fields = [field for field in required_fields if not booking_data.get(field)]
        
        if missing_fields:
            error_msg = f"Påkrævede felter mangler: {', '.join(missing_fields)}"
            print(f"Validering fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Validerer dato format
        try:
            datetime.strptime(booking_data['booking_date'], '%Y-%m-%d')
        except ValueError:
            error_msg = "Ugyldig dato format. Brug YYYY-MM-DD"
            print(f"Dato validationsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        try:
            success = self.db.update_booking(booking_id, booking_data)
            if success:
                print(f"Booking {booking_id} opdateret succesfuldt")
                return {
                    'success': True,
                    'message': 'Booking opdateret succesfuldt'
                }
            else:
                error_msg = "Booking kunne ikke opdateres"
                print(f"Opdateringsfejl: {error_msg}")
                return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved opdatering: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def get_bookings_overview(self):
        """Henter oversigt over alle bookinger med status statistik"""
        print("Genererer booking oversigt")
        
        try:
            bookings = self.db.get_all_bookings()
            
            # Beregner status statistik
            status_counts = {}
            for booking in bookings:
                status = booking['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print(f"Booking oversigt genereret - Total: {len(bookings)}")
            print(f"Status fordeling: {status_counts}")
            
            return {
                'success': True,
                'bookings': bookings,
                'total_count': len(bookings),
                'status_counts': status_counts
            }
        except Exception as e:
            error_msg = f"Fejl ved hentning af bookinger: {str(e)}"
            print(f"Database fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def update_booking_status(self, booking_id, new_status):
        """Opdaterer status på en eksisterende booking"""
        print(f"Opdaterer booking {booking_id} til status: {new_status}")
        
        # Validerer status værdier
        valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            error_msg = f"Ugyldig status. Tilladte værdier: {', '.join(valid_statuses)}"
            print(f"Status validationsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        try:
            success = self.db.update_booking_status(booking_id, new_status)
            if success:
                print(f"Status opdateret succesfuldt for booking {booking_id}")
                return {
                    'success': True,
                    'message': f'Booking status opdateret til {new_status}'
                }
            else:
                error_msg = f"Booking med ID {booking_id} ikke fundet"
                print(f"Opdateringsfejl: {error_msg}")
                return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved opdatering: {error_msg}")
            return {'success': False, 'error': error_msg} 