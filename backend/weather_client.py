import urllib.request
import urllib.parse
import json

OWM_API_KEY = "445bc4c20e24319e6f90bc1a5d78bb24"

def get_weather(location_query):
    if not location_query:
        return {"success": False, "error": "Location not provided"}
    try:
        # Override for specific locations with known geocoding issues
        OVERRIDES = {
            "vaniyambadi": {"lat": 12.6833, "lon": 78.6167, "name": "Vaniyambadi"}
        }
        
        loc_lower = location_query.lower().strip()
        if loc_lower in OVERRIDES:
            lat = OVERRIDES[loc_lower]["lat"]
            lon = OVERRIDES[loc_lower]["lon"]
            location_name = OVERRIDES[loc_lower]["name"]
        else:
            # Append ,IN to prioritize Indian cities for ambiguous names
            safe_query = urllib.parse.quote(f"{location_query},IN")
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={safe_query}&limit=1&appid={OWM_API_KEY}"
            
            with urllib.request.urlopen(geo_url, timeout=10) as response:
                geo_data = json.loads(response.read().decode('utf-8'))
                
            if not geo_data:
                # Fallback without ,IN if not found
                safe_query = urllib.parse.quote(location_query)
                geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={safe_query}&limit=1&appid={OWM_API_KEY}"
                with urllib.request.urlopen(geo_url, timeout=10) as response:
                    geo_data = json.loads(response.read().decode('utf-8'))
                if not geo_data:
                    return {"success": False, "error": "Location not found"}
                
            lat = geo_data[0]['lat']
            lon = geo_data[0]['lon']
            location_name = geo_data[0].get('name', location_query)
        
        # Step 2: Fetch Real-Time Weather (Adding a cache buster timestamp to ensure real-time data)
        import time
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OWM_API_KEY}&units=metric&_={int(time.time())}"
        
        with urllib.request.urlopen(weather_url, timeout=10) as response:
            weather_data = json.loads(response.read().decode('utf-8'))
            
        # Step 3: Map to Frontend Format
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
def get_7_day_forecast(location_name):
    return []
