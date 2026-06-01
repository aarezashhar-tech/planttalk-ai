import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs
import database
import weather_client
import ai_engine
import os

PORT = int(os.environ.get('PORT', 8000))

# Add this near the top of server.py
forecast_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 1800 # 30 minutes in seconds

# Initialize DB in the backend dir
database.init_db()

class APICallHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/auth':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            provider = data.get('provider', data.get('authMode', 'guest'))
            contact = data.get('contact', '')
            otp = data.get('otp')
            
            if provider == 'phone' and not otp:
                self.send_response(200)
                self.send_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'otp_sent', 'message': 'Mock OTP sent'}).encode('utf-8'))
                return
                
            import sqlite3
            import database
            conn = sqlite3.connect(database.DB_PATH)
            c = conn.cursor()
            c.execute('SELECT id FROM users WHERE auth_provider=? AND contact_info=?', (provider, contact))
            row = c.fetchone()
            if row:
                user_id = row[0]
            else:
                c.execute('INSERT INTO users (auth_provider, contact_info) VALUES (?, ?)', (provider, contact))
                user_id = c.lastrowid
                conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'user_id': user_id, 'contact': contact}).encode('utf-8'))
            return
            
        if parsed_path.path == '/api/profile':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            database.save_profile(
                user_id=data.get('user_id'),
                name=data.get('farmerName', ''),
                location=data.get('location', ''),
                crop=data.get('crop', ''),
                language_pref=data.get('language', 'English')
            )
            
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
            return
            
        if parsed_path.path == '/api/diagnose':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request_json = json.loads(post_data.decode('utf-8'))
            
            base64_img = request_json.get('image')
            mime_type = request_json.get('mime_type', 'image/jpeg')
            
            if not base64_img:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'No image data provided'}).encode('utf-8'))
                return
            
            import ai_vision
            result = ai_vision.analyze_plant_image(base64_img, mime_type)
            
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            return
            
        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/insights':
            query = parse_qs(parsed_path.query)
            user_id = query.get('user_id', [None])[0]
            
            if not user_id or user_id == 'undefined' or user_id == 'null':
                self.send_response(400)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing user_id'}).encode('utf-8'))
                return
                
            try:
                user_id_int = int(user_id)
            except ValueError:
                self.send_response(400)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid user_id'}).encode('utf-8'))
                return
                
            profile = database.get_profile(user_id_int)
            if not profile:
                self.send_response(404)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Profile not found'}).encode('utf-8'))
                return
                
            location = profile.get('location', '')
            crop = profile.get('crop', 'Crop')
            lang = profile.get('language_pref', 'English')
            
            weather_result = weather_client.get_weather(location)
            
            if weather_result.get("success") is False:
                payload = {
                    "weather": weather_result,
                    "profile": profile,
                    "insights": None
                }
            else:
                insights = ai_engine.generate_crop_insights(
                    weather_result['temperature'], 
                    weather_result['humidity'], 
                    crop, 
                    lang
                )
                payload = {
                    "weather": weather_result,
                    "profile": profile,
                    "insights": insights
                }
            
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode('utf-8'))
            return
            
        if parsed_path.path == '/api/forecast':
            query = parse_qs(parsed_path.query)
            user_id = query.get('user_id', [None])[0]
            
            if not user_id or user_id == 'undefined' or user_id == 'null':
                self.send_response(400)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing user_id'}).encode('utf-8'))
                return
                
            try:
                user_id_int = int(user_id)
            except ValueError:
                self.send_response(400)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid user_id'}).encode('utf-8'))
                return
                
            profile = database.get_profile(user_id_int)
            location = profile.get('location', '') if profile else ''
            
            forecast = weather_client.get_7_day_forecast(location)
            
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'forecast': forecast}).encode('utf-8'))
            return
            
        if self.path.startswith('/api/india-forecast'):
            import time
            global forecast_cache
            
            current_time = time.time()
            if forecast_cache["data"] is None or (current_time - forecast_cache["timestamp"]) > CACHE_TTL:
                from india_forecast import generate_india_forecast
                result = generate_india_forecast()
                if "error" not in result:
                    forecast_cache = {"data": result, "timestamp": current_time}
            else:
                result = forecast_cache["data"]
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            return

        if parsed_path.path == '/api/soil':
            try:
                query = parse_qs(parsed_path.query)
                lat_str = query.get('lat', [None])[0]
                lon_str = query.get('lon', [None])[0]
                
                print(f"Incoming /api/soil request: lat={lat_str}, lon={lon_str}", flush=True)
                
                if not lat_str or not lon_str:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing lat or lon'}).encode('utf-8'))
                    return
                    
                try:
                    lat = float(lat_str)
                    lon = float(lon_str)
                except ValueError:
                    self.send_response(400)
                    self.send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Invalid lat or lon'}).encode('utf-8'))
                    return
                    
                try:
                    cached_data = database.get_soil_data(lat, lon)
                except Exception as e:
                    print(f"Database error in get_soil_data: {e}", flush=True)
                    cached_data = None

                if cached_data:
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'ph': cached_data['ph'],
                        'n': cached_data['nitrogen'],
                        'p': cached_data['phosphorus'],
                        'k': cached_data['potassium']
                    }).encode('utf-8'))
                    return
                    
                # Fetch from ISRIC
                import urllib.request
                import traceback
                
                try:
                    # Add timeout to prevent hanging forever
                    url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=phh2o&property=nitrogen&property=p&property=k&depth=0-5cm&value=mean"
                    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
                    with urllib.request.urlopen(req, timeout=30) as response:
                        data = json.loads(response.read().decode('utf-8'))
                        
                        props = data.get('properties', {}).get('layers', [])
                        soil_values = {'ph': None, 'n': None, 'p': None, 'k': None}
                        
                        for layer in props:
                            prop_name = layer.get('name')
                            mean_val = None
                            if layer.get('depths') and len(layer['depths']) > 0:
                                mean_val = layer['depths'][0].get('values', {}).get('mean')
                                
                            if mean_val is not None:
                                if prop_name == 'phh2o':
                                    soil_values['ph'] = mean_val / 10.0
                                elif prop_name == 'nitrogen':
                                    soil_values['n'] = mean_val
                                elif prop_name == 'p':
                                    soil_values['p'] = mean_val
                                elif prop_name == 'k':
                                    soil_values['k'] = mean_val
                                    
                        # Save to cache
                        try:
                            database.save_soil_data(lat, lon, soil_values['ph'], soil_values['n'], soil_values['p'], soil_values['k'])
                        except Exception as e:
                            print(f"Database error in save_soil_data: {e}", flush=True)
                        
                        self.send_response(200)
                        self.send_cors_headers()
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps(soil_values).encode('utf-8'))
                        return
                except Exception as e:
                    print(f"ISRIC API failed: {e}. Falling back to estimated values.", flush=True)
                    abs_lat = abs(lat)
                    if abs_lat <= 23.5:
                        # Tropical
                        estimated_soil = {'ph': 5.8, 'n': 1.2, 'p': 15.0, 'k': 120.0}
                    elif abs_lat <= 60:
                        # Temperate
                        estimated_soil = {'ph': 6.5, 'n': 2.5, 'p': 25.0, 'k': 180.0}
                    else:
                        # Polar/Boreal
                        estimated_soil = {'ph': 6.0, 'n': 1.5, 'p': 10.0, 'k': 80.0}
                        
                    self.send_response(200)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(estimated_soil).encode('utf-8'))
                    return
            except Exception as e:
                import traceback
                error_msg = traceback.format_exc()
                print(f"Unhandled Error in /api/soil: {error_msg}", flush=True)
                self.send_response(500)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Internal server error', 'details': str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

def run(server_class=http.server.HTTPServer, handler_class=APICallHandler, port=PORT):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving API at port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
