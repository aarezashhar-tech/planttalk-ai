import urllib.request
import urllib.error
import json
import os
import traceback

def analyze_plant_image(base64_image, mime_type="image/jpeg"):
    try:
        print("DEBUG [ai_vision]: analyze_plant_image called.", flush=True)
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
        print(f"DEBUG [ai_vision]: GEMINI_API_KEY is {'SET' if GEMINI_API_KEY else 'NOT SET'}, length={len(GEMINI_API_KEY)}", flush=True)
        
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is missing or empty.")
            
        print(f"DEBUG [ai_vision]: base64_image length received: {len(base64_image) if base64_image else 0}", flush=True)
        
        if not base64_image:
            raise ValueError("No image data provided to analyze.")

        # Strip data URI prefix if frontend accidentally sends it
        if ',' in base64_image[:100]:
            print("DEBUG [ai_vision]: Stripping data URI prefix from base64_image", flush=True)
            base64_image = base64_image.split(',', 1)[1]

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Act as an expert agricultural botanist. Analyze this plant image. Identify the plant and any visible diseases, pests, or nutrient deficiencies. Provide a clear, short diagnosis and 3 bullet points for recommended organic treatment."},
                    {"inline_data": {"mime_type": mime_type, "data": base64_image}}
                ]
            }]
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        
        print("DEBUG [ai_vision]: Sending POST request to Gemini API (gemini-1.5-flash)...", flush=True)
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode('utf-8')
            print("DEBUG [ai_vision]: Received success response from Gemini API.", flush=True)
            result = json.loads(response_body)
            text = result['candidates'][0]['content']['parts'][0]['text']
            return {"success": True, "analysis": text}
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"ERROR [ai_vision]: Gemini API HTTP Error {e.code}: {error_body}", flush=True)
        # Try to extract a readable message from the JSON error
        try:
            err_json = json.loads(error_body)
            msg = err_json.get('error', {}).get('message', error_body)
        except Exception:
            msg = error_body
        return {"success": False, "error": f"Gemini API HTTP Error {e.code}: {msg}", "details": error_body}
        
    except urllib.error.URLError as e:
        print(f"ERROR [ai_vision]: Network error reaching Gemini API: {e.reason}", flush=True)
        return {"success": False, "error": f"Network error: {e.reason}"}
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"ERROR [ai_vision]: Unhandled exception in analyze_plant_image:\n{error_trace}", flush=True)
        return {"success": False, "error": f"Internal Server Error: {str(e)}", "traceback": error_trace}
