import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise Exception('DATABASE_URL environment variable not set')

def get_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            auth_provider TEXT,
            contact_info TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users (id),
            name TEXT,
            location TEXT,
            crop TEXT,
            language_pref TEXT
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (lat, lon)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS diagnoses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users (id),
            image_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_or_create_user(auth_provider="guest", contact_info=None):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE auth_provider=%s AND contact_info=%s', (auth_provider, contact_info))
    row = c.fetchone()
    if row:
        user_id = row['id']
    else:
        c.execute('INSERT INTO users (auth_provider, contact_info) VALUES (%s, %s) RETURNING id', (auth_provider, contact_info))
        user_id = c.fetchone()['id']
        conn.commit()
    conn.close()
    return user_id

def create_user(auth_provider="guest", contact_info=None):
    return get_or_create_user(auth_provider, contact_info)

def get_soil_data(lat, lon):
    conn = get_connection()
    c = conn.cursor()
    # Cache for 30 days
    c.execute("SELECT * FROM soil_cache WHERE lat=%s AND lon=%s AND created_at >= NOW() - INTERVAL '30 days'", (lat, lon))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def save_soil_data(lat, lon, ph, nitrogen, phosphorus, potassium):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO soil_cache (lat, lon, ph, nitrogen, phosphorus, potassium, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (lat, lon) DO UPDATE SET
            ph=EXCLUDED.ph,
            nitrogen=EXCLUDED.nitrogen,
            phosphorus=EXCLUDED.phosphorus,
            potassium=EXCLUDED.potassium,
            created_at=CURRENT_TIMESTAMP
    ''', (lat, lon, ph, nitrogen, phosphorus, potassium))
    conn.commit()
    conn.close()

def save_profile(user_id, name, location, crop, language_pref):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO profiles (user_id, name, location, crop, language_pref)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT(user_id) DO UPDATE SET
            name=EXCLUDED.name,
            location=EXCLUDED.location,
            crop=EXCLUDED.crop,
            language_pref=EXCLUDED.language_pref
    ''', (user_id, name, location, crop, language_pref))
    conn.commit()
    conn.close()

def get_profile(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM profiles WHERE user_id = %s', (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None
