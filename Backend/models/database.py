import sqlite3
from datetime import datetime
import os

# Database forbindelse og initialisering
class BookingDatabase:
    def __init__(self, db_path="bookings.db"):
        """Initialiserer database forbindelsen og opretter tabeller"""
        self.db_path = db_path
        print(f"Initialiserer database: {db_path}")
        self.init_database()
    
    def get_connection(self):
        """Opretter og returnerer database forbindelse"""
        print("Opretter database forbindelse")
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Tillader dict-like adgang til rækker
        return conn
    
    def init_database(self):
        """Opretter bookings tabellen hvis den ikke eksisterer"""
        print("Initialiserer database tabeller")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Opretter bookings tabel - kun navn, email og dato er påkrævede
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                client_name TEXT NOT NULL,
                booking_date DATE NOT NULL,
                start_time TIME,
                end_time TIME,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                -- Email er påkrævet, resten er valgfrie
                email TEXT NOT NULL,
                mail_received_date DATE,
                last_mail_sent_date DATE,
                participant_count INTEGER,
                time_confirmed BOOLEAN DEFAULT 0,
                film_confirmed BOOLEAN DEFAULT 0,
                film_title TEXT,
                catering_required BOOLEAN DEFAULT 0,
                catering_details TEXT,
                own_room BOOLEAN DEFAULT 0,
                foyer_required BOOLEAN DEFAULT 0,
                tech_required BOOLEAN DEFAULT 0,
                price_confirmed BOOLEAN DEFAULT 0,
                ticket_price_sent BOOLEAN DEFAULT 0,
                extra_staff BOOLEAN DEFAULT 0,
                staff_informed BOOLEAN DEFAULT 0,
                tickets_reserved BOOLEAN DEFAULT 0,
                terms_written BOOLEAN DEFAULT 0,
                on_special_list BOOLEAN DEFAULT 0
            )
        ''')
        
        print("Database tabeller oprettet succesfuldt med udvidede felter")
        conn.commit()
        conn.close()
    
    def create_booking(self, booking_data):
        """Opretter en ny booking i databasen - kun navn, email og dato er påkrævet"""
        print(f"Opretter ny booking: {booking_data.get('client_name', 'Unavngivet')}")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO bookings (
                title, description, client_name, booking_date, start_time, end_time, status,
                email, mail_received_date, last_mail_sent_date, participant_count, 
                time_confirmed, film_confirmed, film_title, catering_required, catering_details,
                own_room, foyer_required, tech_required, price_confirmed, ticket_price_sent,
                extra_staff, staff_informed, tickets_reserved, terms_written, on_special_list
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            booking_data.get('title', ''),  # Valgfri
            booking_data.get('description', ''),
            booking_data['client_name'],  # Påkrævet
            booking_data['booking_date'],  # Påkrævet
            booking_data.get('start_time', None),  # Valgfri
            booking_data.get('end_time', None),  # Valgfri
            booking_data.get('status', 'pending'),
            # Email er påkrævet
            booking_data['email'],  # Påkrævet
            booking_data.get('mail_received_date', None),
            booking_data.get('last_mail_sent_date', None),
            booking_data.get('participant_count', None),
            booking_data.get('time_confirmed', 0),
            booking_data.get('film_confirmed', 0),
            booking_data.get('film_title', ''),
            booking_data.get('catering_required', 0),
            booking_data.get('catering_details', ''),
            booking_data.get('own_room', 0),
            booking_data.get('foyer_required', 0),
            booking_data.get('tech_required', 0),
            booking_data.get('price_confirmed', 0),
            booking_data.get('ticket_price_sent', 0),
            booking_data.get('extra_staff', 0),
            booking_data.get('staff_informed', 0),
            booking_data.get('tickets_reserved', 0),
            booking_data.get('terms_written', 0),
            booking_data.get('on_special_list', 0)
        ))
        
        booking_id = cursor.lastrowid
        print(f"Booking oprettet med ID: {booking_id}")
        conn.commit()
        conn.close()
        return booking_id
    
    def get_all_bookings(self):
        """Henter alle bookinger fra databasen med alle felter"""
        print("Henter alle bookinger fra database")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM bookings 
            ORDER BY booking_date DESC, start_time DESC
        ''')
        
        bookings = [dict(row) for row in cursor.fetchall()]
        print(f"Hentet {len(bookings)} bookinger")
        conn.close()
        return bookings
    
    def get_booking_by_id(self, booking_id):
        """Henter en specifik booking baseret på ID"""
        print(f"Henter booking med ID: {booking_id}")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,))
        booking = cursor.fetchone()
        
        if booking:
            print(f"Booking fundet: {booking['title']}")
            return dict(booking)
        else:
            print(f"Ingen booking fundet med ID: {booking_id}")
            return None
        
        conn.close()
    
    def update_booking(self, booking_id, booking_data):
        """Opdaterer en eksisterende booking med alle felter"""
        print(f"Opdaterer booking {booking_id}")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE bookings SET
                title = ?, description = ?, client_name = ?, booking_date = ?,
                start_time = ?, end_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP,
                email = ?, mail_received_date = ?, last_mail_sent_date = ?, participant_count = ?,
                time_confirmed = ?, film_confirmed = ?, film_title = ?, catering_required = ?,
                catering_details = ?, own_room = ?, foyer_required = ?, tech_required = ?,
                price_confirmed = ?, ticket_price_sent = ?, extra_staff = ?, staff_informed = ?,
                tickets_reserved = ?, terms_written = ?, on_special_list = ?
            WHERE id = ?
        ''', (
            booking_data.get('title', ''),  # Valgfri
            booking_data.get('description', ''),
            booking_data['client_name'],  # Påkrævet
            booking_data['booking_date'],  # Påkrævet
            booking_data.get('start_time', None),  # Valgfri
            booking_data.get('end_time', None),  # Valgfri
            booking_data.get('status', 'pending'),
            booking_data['email'],  # Påkrævet
            booking_data.get('mail_received_date', None),
            booking_data.get('last_mail_sent_date', None),
            booking_data.get('participant_count', None),
            booking_data.get('time_confirmed', 0),
            booking_data.get('film_confirmed', 0),
            booking_data.get('film_title', ''),
            booking_data.get('catering_required', 0),
            booking_data.get('catering_details', ''),
            booking_data.get('own_room', 0),
            booking_data.get('foyer_required', 0),
            booking_data.get('tech_required', 0),
            booking_data.get('price_confirmed', 0),
            booking_data.get('ticket_price_sent', 0),
            booking_data.get('extra_staff', 0),
            booking_data.get('staff_informed', 0),
            booking_data.get('tickets_reserved', 0),
            booking_data.get('terms_written', 0),
            booking_data.get('on_special_list', 0),
            booking_id
        ))
        
        rows_affected = cursor.rowcount
        print(f"Opdateret {rows_affected} rækker")
        conn.commit()
        conn.close()
        return rows_affected > 0

    def update_booking_status(self, booking_id, status):
        """Opdaterer status på en booking"""
        print(f"Opdaterer booking {booking_id} status til: {status}")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE bookings 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (status, booking_id))
        
        rows_affected = cursor.rowcount
        print(f"Opdateret {rows_affected} rækker")
        conn.commit()
        conn.close()
        return rows_affected > 0 