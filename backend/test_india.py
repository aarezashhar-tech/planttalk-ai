import sys
from india_forecast import generate_india_forecast

sys.stdout.reconfigure(encoding='utf-8')

print("Fetching India regional forecast...")
d = generate_india_forecast(force_refresh=True)

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
        print(f"  {reg['name']}: {s['stationCount']} stations, avg {s['avgTemp']}°C, max {s['maxTemp']}°C, min {s['minTemp']}°C, alert: {s['alertLevel']}, alerts: {s['totalAlerts']}")
        for st in reg['stations'][:2]:  # print first 2 stations per region
            c = st['current']
            alerts_count = len(st['alerts'])
            alerts_str = f" ALERTS:{alerts_count}" if alerts_count else ""
            print(f"    - {st['city']} ({st['state']}): {c['temp']}°C, humidity:{c['humidity']}%, wind:{c['wind']}km/h, UV:{c['uv']}{alerts_str}")
