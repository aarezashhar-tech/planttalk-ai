import urllib.request
import json
import sys

import os
API_KEY = os.environ.get('GEMINI_API_KEY', '')
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}'

headers = {'Content-Type': 'application/json'}
payload = {
    'contents': [{
        'parts': [
            {'text': 'Hello, are you gemini-2.5-flash?'}
        ]
    }]
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('Success:', result['candidates'][0]['content']['parts'][0]['text'])
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
