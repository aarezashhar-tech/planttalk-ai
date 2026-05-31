import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    r = urllib.request.urlopen('http://localhost:8000/api/india-forecast', timeout=60)
    d = json.loads(r.read())
    if 'error' in d:
        print(f"ERROR: {d['error']}")
    else:
        print(f"Regions: {len(d.get('regions', []))}")
        print(f"Total Stations: {d.get('station_count', 0)}")
        print(f"Generated: {d.get('generated_at', '?')}")
        print(f"Models: {', '.join(d.get('model_sources', []))}")
        print()
        for reg in d.get('regions', []):
            s = reg['summary']
            print(f"  {reg['name']}: {s['stationCount']} stations, avg {s['avgTemp']}C, max {s['maxTemp']}C, alert: {s['alertLevel']}, alerts: {s['totalAlerts']}")
            for st in reg['stations']:
                c = st['current']
                alerts_count = len(st['alerts'])
                alerts_str = f" ALERTS:{alerts_count}" if alerts_count else ""
                print(f"    - {st['city']} ({st['state']}): {c['temp']}C, humidity:{c['humidity']}%, wind:{c['wind']}km/h, UV:{c['uv']}{alerts_str}")
except Exception as e:
    print(f"Error: {e}")
