import urllib.request
import urllib.parse
import json
import time

OWM_API_KEY = "445bc4c20e24319e6f90bc1a5d78bb24"

def get_weather(lat, lon, location_name="Unknown Location"):
    try:
        # Fetch Real-Time Weather (Adding a cache buster timestamp to ensure real-time data)
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OWM_API_KEY}&units=metric&_={int(time.time())}"
        
        with urllib.request.urlopen(weather_url, timeout=10) as response:
            weather_data = json.loads(response.read().decode('utf-8'))
            
        # Map to Frontend Format
        return {
            "success": True,
            "temperature": round(weather_data['main']['temp']),
            "humidity": weather_data['main']['humidity'],
            "rainChance": weather_data.get('rain', {}).get('1h', 0),
            "locationName": location_name
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Stub to prevent server.py /api/forecast from crashing
def get_7_day_forecast(lat, lon, location_name="Unknown Location"):
    return []
