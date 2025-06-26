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
                tech_details TEXT,
                arrangement_price DECIMAL(10,2),
                ticket_price_sent BOOLEAN DEFAULT 0,
                extra_staff BOOLEAN DEFAULT 0,
                staff_informed BOOLEAN DEFAULT 0,
                tickets_reserved BOOLEAN DEFAULT 0,
                terms_written BOOLEAN DEFAULT 0,
                on_special_list BOOLEAN DEFAULT 0,
                
                -- Biograf lokation felt - for at vælge mellem Kennedy og City Syd
                cinema_location TEXT DEFAULT 'Kennedy',
                
                -- Arkiv og faktura felter jf. ønsket funktionalitet
                is_archived BOOLEAN DEFAULT 0,
                invoice_sent BOOLEAN DEFAULT 0,
                invoice_file_path TEXT,
                revenue_analysis TEXT
            )
        ''')
        
        # Tilføj arkiv og faktura kolonner til eksisterende tabeller hvis de ikke findes
        cursor.execute("PRAGMA table_info(bookings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_archived' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN is_archived BOOLEAN DEFAULT 0')
            print("Tilføjet is_archived kolonne")
            
        if 'invoice_sent' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN invoice_sent BOOLEAN DEFAULT 0')
            print("Tilføjet invoice_sent kolonne")
            
        if 'invoice_file_path' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN invoice_file_path TEXT')
            print("Tilføjet invoice_file_path kolonne")
            
        if 'revenue_analysis' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN revenue_analysis TEXT')
            print("Tilføjet revenue_analysis kolonne")
            
        if 'cinema_location' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN cinema_location TEXT DEFAULT NULL')
            print("Tilføjet cinema_location kolonne")
            
        if 'tech_details' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN tech_details TEXT')
            print("Tilføjet tech_details kolonne")
            
        if 'arrangement_price' not in columns:
            cursor.execute('ALTER TABLE bookings ADD COLUMN arrangement_price DECIMAL(10,2)')
            print("Tilføjet arrangement_price kolonne")
        
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
                own_room, foyer_required, tech_required, tech_details, arrangement_price, ticket_price_sent,
                price_confirmed,
                extra_staff, staff_informed, tickets_reserved, terms_written, on_special_list,
                cinema_location, is_archived, invoice_sent, invoice_file_path, revenue_analysis
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            booking_data.get('tech_details', ''),
            booking_data.get('arrangement_price', 0),
            booking_data.get('ticket_price_sent', 0),
            booking_data.get('price_confirmed', 0),
            booking_data.get('extra_staff', 0),
            booking_data.get('staff_informed', 0),
            booking_data.get('tickets_reserved', 0),
            booking_data.get('terms_written', 0),
            booking_data.get('on_special_list', 0),
            # Biograf lokation felt
            booking_data.get('cinema_location', None),
            # Nye arkiv og faktura felter
            booking_data.get('is_archived', 0),
            booking_data.get('invoice_sent', 0),
            booking_data.get('invoice_file_path', ''),
            booking_data.get('revenue_analysis', '')
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
            booking_dict = dict(booking)
            print(f"Booking fundet: {booking_dict.get('title', 'Uden titel')}")
            conn.close()
            return booking_dict
        else:
            print(f"Ingen booking fundet med ID: {booking_id}")
            conn.close()
            return None
    
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
                tech_details = ?, arrangement_price = ?, price_confirmed = ?, ticket_price_sent = ?, extra_staff = ?, staff_informed = ?,
                tickets_reserved = ?, terms_written = ?, on_special_list = ?, cinema_location = ?,
                is_archived = ?, invoice_sent = ?, invoice_file_path = ?, revenue_analysis = ?
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
            booking_data.get('tech_details', ''),
            booking_data.get('arrangement_price', 0),
            booking_data.get('price_confirmed', 0),
            booking_data.get('ticket_price_sent', 0),
            booking_data.get('extra_staff', 0),
            booking_data.get('staff_informed', 0),
            booking_data.get('tickets_reserved', 0),
            booking_data.get('terms_written', 0),
            booking_data.get('on_special_list', 0),
            # Biograf lokation felt
            booking_data.get('cinema_location', None),
            # Nye arkiv og faktura felter
            booking_data.get('is_archived', 0),
            booking_data.get('invoice_sent', 0),
            booking_data.get('invoice_file_path', ''),
            booking_data.get('revenue_analysis', ''),
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

    # Arkiv funktioner jf. ønsket funktionalitet
    def get_active_bookings(self):
        """Henter kun aktive (ikke-arkiverede) bookinger"""
        print("Henter aktive bookinger (ikke-arkiverede)")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM bookings 
            WHERE is_archived = 0 
            ORDER BY booking_date DESC, start_time DESC
        ''')
        
        bookings = [dict(row) for row in cursor.fetchall()]
        print(f"Hentet {len(bookings)} aktive bookinger")
        conn.close()
        return bookings
    
    def get_archived_bookings(self):
        """Henter kun arkiverede bookinger"""
        print("Henter arkiverede bookinger")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM bookings 
            WHERE is_archived = 1 
            ORDER BY booking_date DESC, start_time DESC
        ''')
        
        bookings = [dict(row) for row in cursor.fetchall()]
        print(f"Hentet {len(bookings)} arkiverede bookinger")
        conn.close()
        return bookings
    
    def archive_booking(self, booking_id):
        """Arkiverer en specifik booking"""
        print(f"Arkiverer booking {booking_id}")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE bookings 
            SET is_archived = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (booking_id,))
        
        rows_affected = cursor.rowcount
        print(f"Arkiveret {rows_affected} booking")
        conn.commit()
        conn.close()
        return rows_affected > 0
    
    def auto_archive_expired_bookings(self):
        """Automatisk arkivering af udløbne bookinger jf. ønsket funktionalitet"""
        print("Kører automatisk arkivering af udløbne bookinger")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Arkiverer bookinger hvor booking_date er passeret
        cursor.execute('''
            UPDATE bookings 
            SET is_archived = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE booking_date < DATE('now') AND is_archived = 0
        ''')
        
        rows_affected = cursor.rowcount
        print(f"Automatisk arkiveret {rows_affected} udløbne bookinger")
        conn.commit()
        conn.close()
        return rows_affected 