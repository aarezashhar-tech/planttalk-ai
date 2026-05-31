import urllib.request
import json

try:
    response = urllib.request.urlopen("http://localhost:8000/api/india-forecast", timeout=10)
    data = json.loads(response.read().decode('utf-8'))
    print("KEYS:", data.keys())
    if "error" in data:
        print("ERROR:", data["error"])
    else:
        print("SUCCESS! Regions:", len(data.get("regions", [])))
except Exception as e:
    print("EXCEPTION:", e)
