import urllib.request
import json
import sys

import os
API_KEY = os.environ.get('GEMINI_API_KEY', '')
url = f'https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}'
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        for m in data.get('models', []):
            if 'vision' in m['name'].lower() or 'flash' in m['name'].lower() or 'gemini' in m['name'].lower():
                print(m['name'], '-', m.get('supportedGenerationMethods', []))
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
