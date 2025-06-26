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
                print(f"Booking fundet: {booking.get('title', 'Uden titel')}")
                return {
                    'success': True,
                    'data': booking
                }
            else:
                error_msg = f"Booking med ID {booking_id} ikke fundet"
                print(f"Booking ikke fundet: {error_msg}")
                return {'success': False, 'error': error_msg, 'data': None}
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved hentning: {error_msg}")
            return {'success': False, 'error': error_msg, 'data': None}
    
    def update_booking(self, booking_id, booking_data):
        """Opdaterer en eksisterende booking med alle data"""
        print(f"Opdaterer booking {booking_id}")
        
        # Validerer at booking eksisterer
        existing_booking = self.db.get_booking_by_id(booking_id)
        if not existing_booking:
            error_msg = f"Booking med ID {booking_id} ikke fundet"
            print(f"Opdateringsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Slår ny data sammen med eksisterende, så vi kan validere fulde data inkl. felter der ikke blev sendt
        merged_data = { **existing_booking, **booking_data }  # booking_data har forrang

        # Validerer påkrævede felter - kun navn, email og dato er påkrævet ved opdatering
        required_fields = ['client_name', 'email', 'booking_date']  
        missing_fields = [field for field in required_fields if not merged_data.get(field)]
        
        if missing_fields:
            error_msg = f"Påkrævede felter mangler: {', '.join(missing_fields)}"
            print(f"Validering fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        # Validerer dato format
        try:
            datetime.strptime(merged_data['booking_date'], '%Y-%m-%d')
        except ValueError:
            error_msg = "Ugyldig dato format. Brug YYYY-MM-DD"
            print(f"Dato validationsfejl: {error_msg}")
            return {'success': False, 'error': error_msg}
        
        try:
            success = self.db.update_booking(booking_id, merged_data)
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

    # Arkiv funktioner jf. ønsket funktionalitet fra sedel
    def get_active_bookings_overview(self):
        """Henter oversigt over kun aktive (ikke-arkiverede) bookinger"""
        print("Genererer aktive booking oversigt")
        
        try:
            # Kører automatisk arkivering først
            self.auto_archive_expired()
            
            bookings = self.db.get_active_bookings()
            
            # Beregner status statistik for aktive bookinger
            status_counts = {}
            for booking in bookings:
                status = booking['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print(f"Aktive booking oversigt genereret - Total: {len(bookings)}")
            print(f"Status fordeling: {status_counts}")
            
            return {
                'success': True,
                'bookings': bookings,
                'total_count': len(bookings),
                'status_counts': status_counts,
                'view_type': 'active'
            }
        except Exception as e:
            error_msg = f"Fejl ved hentning af aktive bookinger: {str(e)}"
            print(f"Database fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def get_archived_bookings_overview(self):
        """Henter oversigt over arkiverede bookinger"""
        print("Genererer arkiveret booking oversigt")
        
        try:
            bookings = self.db.get_archived_bookings()
            
            # Beregner statistik for arkiverede bookinger
            status_counts = {}
            invoice_stats = {'sent': 0, 'pending': 0}
            
            for booking in bookings:
                status = booking['status']
                status_counts[status] = status_counts.get(status, 0) + 1
                
                # Tæller faktura status
                if booking.get('invoice_sent', 0):
                    invoice_stats['sent'] += 1
                else:
                    invoice_stats['pending'] += 1
            
            print(f"Arkiveret booking oversigt genereret - Total: {len(bookings)}")
            print(f"Status fordeling: {status_counts}")
            print(f"Faktura statistik: {invoice_stats}")
            
            return {
                'success': True,
                'bookings': bookings,
                'total_count': len(bookings),
                'status_counts': status_counts,
                'invoice_stats': invoice_stats,
                'view_type': 'archived'
            }
        except Exception as e:
            error_msg = f"Fejl ved hentning af arkiverede bookinger: {str(e)}"
            print(f"Database fejl: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def archive_booking(self, booking_id):
        """Arkiverer en specifik booking manuelt"""
        print(f"Arkiverer booking {booking_id} manuelt")
        
        try:
            success = self.db.archive_booking(booking_id)
            if success:
                print(f"Booking {booking_id} arkiveret succesfuldt")
                return {
                    'success': True,
                    'message': 'Booking arkiveret succesfuldt'
                }
            else:
                error_msg = f"Booking med ID {booking_id} ikke fundet"
                print(f"Arkiveringsfejl: {error_msg}")
                return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Database fejl: {str(e)}"
            print(f"Database fejl ved arkivering: {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def auto_archive_expired(self):
        """Automatisk arkivering af udløbne arrangementer jf. sedel"""
        print("Kører automatisk arkivering af udløbne arrangementer")
        
        try:
            archived_count = self.db.auto_archive_expired_bookings()
            if archived_count > 0:
                print(f"Automatisk arkiveret {archived_count} udløbne arrangementer")
            return {
                'success': True,
                'archived_count': archived_count,
                'message': f'Automatisk arkiveret {archived_count} udløbne arrangementer'
            }
        except Exception as e:
            error_msg = f"Fejl ved automatisk arkivering: {str(e)}"
            print(f"Automatisk arkiveringsfejl: {error_msg}")
            return {'success': False, 'error': error_msg} 