import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'planttalk.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auth_provider TEXT,
            contact_info TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            name TEXT,
            location TEXT,
            crop TEXT,
            language_pref TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS soil_cache (
            lat REAL,
            lon REAL,
            ph REAL,
            nitrogen REAL,
            phosphorus REAL,
            potassium REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (lat, lon)
        )
    ''')
    conn.commit()
    conn.close()

def get_soil_data(lat, lon):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    # Cache for 30 days
    c.execute("SELECT * FROM soil_cache WHERE lat=? AND lon=? AND timestamp >= datetime('now', '-30 days')", (lat, lon))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def save_soil_data(lat, lon, ph, nitrogen, phosphorus, potassium):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO soil_cache (lat, lon, ph, nitrogen, phosphorus, potassium, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(lat, lon) DO UPDATE SET
            ph=excluded.ph,
            nitrogen=excluded.nitrogen,
            phosphorus=excluded.phosphorus,
            potassium=excluded.potassium,
            timestamp=CURRENT_TIMESTAMP
    ''', (lat, lon, ph, nitrogen, phosphorus, potassium))
    conn.commit()
    conn.close()

def create_user(auth_provider="guest", contact_info=None):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO users (auth_provider, contact_info) VALUES (?, ?)', (auth_provider, contact_info))
    user_id = c.lastrowid
    conn.commit()
    conn.close()
    return user_id

def save_profile(user_id, name, location, crop, language_pref):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO profiles (user_id, name, location, crop, language_pref)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            name=excluded.name,
            location=excluded.location,
            crop=excluded.crop,
            language_pref=excluded.language_pref
    ''', (user_id, name, location, crop, language_pref))
    conn.commit()
    conn.close()

def get_profile(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM profiles WHERE user_id = ?', (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None
