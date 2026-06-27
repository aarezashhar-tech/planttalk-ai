import urllib.request
import json
import sys
import time
import traceback

def test_diagnose():
    url = 'http://localhost:8000/api/diagnose'
    payload = {'image': 'dummy_base64_string', 'mime_type': 'image/jpeg'}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        print("\n--- Testing /api/diagnose ---")
        with urllib.request.urlopen(req) as response:
            print(response.read().decode('utf-8'))
    except Exception as e:
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        else:
            traceback.print_exc()

def test_india():
    url = 'http://localhost:8000/api/india-forecast'
    try:
        print("\n--- Testing /api/india-forecast ---")
        with urllib.request.urlopen(url) as response:
            print(f"Success! Got {len(response.read())} bytes.")
    except Exception as e:
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        else:
            traceback.print_exc()

if __name__ == '__main__':
    test_diagnose()
    test_india()
