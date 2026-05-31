import urllib.request
import urllib.error
import json

GEMINI_API_KEY = "AIzaSyB0rmLwNQQfoy97iWnm8Pvkdh9nju23E2M"

def analyze_plant_image(base64_image, mime_type="image/jpeg"):
    # Strip data URI prefix if frontend accidentally sends it
    if base64_image and ',' in base64_image[:100]:
        base64_image = base64_image.split(',', 1)[1]

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
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
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result['candidates'][0]['content']['parts'][0]['text']
            return {"success": True, "analysis": text}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Gemini API HTTP Error {e.code}: {error_body}")
        # Try to extract a readable message from the JSON error
        try:
            err_json = json.loads(error_body)
            msg = err_json.get('error', {}).get('message', error_body)
        except Exception:
            msg = error_body
        return {"success": False, "error": f"Gemini API error ({e.code}): {msg}"}
    except Exception as e:
        print(f"Vision analysis error: {str(e)}")
        return {"success": False, "error": str(e)}
