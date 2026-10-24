import urllib.request
import json
import time
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# 42 Representative IMD Stations across 7 Meteorological Regions
# ═══════════════════════════════════════════════════════════════

INDIA_STATIONS = [
    # ── Northwest India ──
    {"id": 0,  "city": "New Delhi",     "state": "Delhi",            "lat": 28.6139, "lon": 77.2090, "region": "Northwest",      "terrain": "plains"},
    {"id": 1,  "city": "Jaipur",        "state": "Rajasthan",        "lat": 26.9124, "lon": 75.7873, "region": "Northwest",      "terrain": "arid"},
    {"id": 2,  "city": "Chandigarh",    "state": "Chandigarh",       "lat": 30.7333, "lon": 76.7794, "region": "Northwest",      "terrain": "plains"},
    {"id": 3,  "city": "Lucknow",       "state": "Uttar Pradesh",    "lat": 26.8467, "lon": 80.9462, "region": "Northwest",      "terrain": "plains"},
    {"id": 4,  "city": "Shimla",        "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "region": "Northwest",      "terrain": "hills"},
    {"id": 5,  "city": "Dehradun",      "state": "Uttarakhand",      "lat": 30.3165, "lon": 78.0322, "region": "Northwest",      "terrain": "hills"},
    {"id": 6,  "city": "Amritsar",      "state": "Punjab",           "lat": 31.6340, "lon": 74.8723, "region": "Northwest",      "terrain": "plains"},
    # ── Central India ──
    {"id": 7,  "city": "Bhopal",        "state": "Madhya Pradesh",   "lat": 23.2599, "lon": 77.4126, "region": "Central",        "terrain": "plains"},
    {"id": 8,  "city": "Nagpur",        "state": "Maharashtra",      "lat": 21.1458, "lon": 79.0882, "region": "Central",        "terrain": "plains"},
    {"id": 9,  "city": "Indore",        "state": "Madhya Pradesh",   "lat": 22.7196, "lon": 75.8577, "region": "Central",        "terrain": "plains"},
    {"id": 10, "city": "Raipur",        "state": "Chhattisgarh",     "lat": 21.2514, "lon": 81.6296, "region": "Central",        "terrain": "plains"},
    {"id": 11, "city": "Jabalpur",      "state": "Madhya Pradesh",   "lat": 23.1815, "lon": 79.9864, "region": "Central",        "terrain": "plains"},
    # ── East India ──
    {"id": 12, "city": "Kolkata",       "state": "West Bengal",      "lat": 22.5726, "lon": 88.3639, "region": "East",           "terrain": "coastal"},
    {"id": 13, "city": "Patna",         "state": "Bihar",            "lat": 25.6093, "lon": 85.1376, "region": "East",           "terrain": "plains"},
    {"id": 14, "city": "Bhubaneswar",   "state": "Odisha",           "lat": 20.2961, "lon": 85.8245, "region": "East",           "terrain": "coastal"},
    {"id": 15, "city": "Ranchi",        "state": "Jharkhand",        "lat": 23.3441, "lon": 85.3096, "region": "East",           "terrain": "hills"},
    {"id": 16, "city": "Varanasi",      "state": "Uttar Pradesh",    "lat": 25.3176, "lon": 82.9739, "region": "East",           "terrain": "plains"},
    # ── Northeast India ──
    {"id": 17, "city": "Guwahati",      "state": "Assam",            "lat": 26.1445, "lon": 91.7362, "region": "Northeast",      "terrain": "plains"},
    {"id": 18, "city": "Shillong",      "state": "Meghalaya",        "lat": 25.5788, "lon": 91.8933, "region": "Northeast",      "terrain": "hills"},
    {"id": 19, "city": "Imphal",        "state": "Manipur",          "lat": 24.8170, "lon": 93.9368, "region": "Northeast",      "terrain": "hills"},
    {"id": 20, "city": "Agartala",      "state": "Tripura",          "lat": 23.8315, "lon": 91.2868, "region": "Northeast",      "terrain": "plains"},
    {"id": 21, "city": "Aizawl",        "state": "Mizoram",          "lat": 23.7271, "lon": 92.7176, "region": "Northeast",      "terrain": "hills"},
    {"id": 22, "city": "Itanagar",      "state": "Arunachal Pradesh","lat": 27.0844, "lon": 93.6053, "region": "Northeast",      "terrain": "hills"},
    # ── West India ──
    {"id": 23, "city": "Mumbai",        "state": "Maharashtra",      "lat": 19.0760, "lon": 72.8777, "region": "West",           "terrain": "coastal"},
    {"id": 24, "city": "Ahmedabad",     "state": "Gujarat",          "lat": 23.0225, "lon": 72.5714, "region": "West",           "terrain": "plains"},
    {"id": 25, "city": "Pune",          "state": "Maharashtra",      "lat": 18.5204, "lon": 73.8567, "region": "West",           "terrain": "hills"},
    {"id": 26, "city": "Surat",         "state": "Gujarat",          "lat": 21.1702, "lon": 72.8311, "region": "West",           "terrain": "coastal"},
    {"id": 27, "city": "Panaji",        "state": "Goa",              "lat": 15.4909, "lon": 73.8278, "region": "West",           "terrain": "coastal"},
    # ── South Peninsula ──
    {"id": 28, "city": "Chennai",       "state": "Tamil Nadu",       "lat": 13.0827, "lon": 80.2707, "region": "South Peninsula","terrain": "coastal"},
    {"id": 29, "city": "Bengaluru",     "state": "Karnataka",        "lat": 12.9716, "lon": 77.5946, "region": "South Peninsula","terrain": "hills"},
    {"id": 30, "city": "Hyderabad",     "state": "Telangana",        "lat": 17.3850, "lon": 78.4867, "region": "South Peninsula","terrain": "plains"},
    {"id": 31, "city": "Thiruvananthapuram", "state": "Kerala",      "lat": 8.5241,  "lon": 76.9366, "region": "South Peninsula","terrain": "coastal"},
    {"id": 32, "city": "Kochi",         "state": "Kerala",           "lat": 9.9312,  "lon": 76.2673, "region": "South Peninsula","terrain": "coastal"},
    {"id": 33, "city": "Visakhapatnam", "state": "Andhra Pradesh",   "lat": 17.6868, "lon": 83.2185, "region": "South Peninsula","terrain": "coastal"},
    {"id": 34, "city": "Coimbatore",    "state": "Tamil Nadu",       "lat": 11.0168, "lon": 76.9558, "region": "South Peninsula","terrain": "plains"},
    {"id": 35, "city": "Mangaluru",     "state": "Karnataka",        "lat": 12.9141, "lon": 74.8560, "region": "South Peninsula","terrain": "coastal"},
    {"id": 36, "city": "Madurai",       "state": "Tamil Nadu",       "lat": 9.9252,  "lon": 78.1198, "region": "South Peninsula","terrain": "plains"},
    # ── Islands ──
    {"id": 37, "city": "Port Blair",    "state": "Andaman & Nicobar","lat": 11.6234, "lon": 92.7265, "region": "Islands",        "terrain": "coastal"},
    {"id": 38, "city": "Kavaratti",     "state": "Lakshadweep",      "lat": 10.5626, "lon": 72.6369, "region": "Islands",        "terrain": "coastal"},
    # ── Additional strategic stations ──
    {"id": 39, "city": "Jodhpur",       "state": "Rajasthan",        "lat": 26.2389, "lon": 73.0243, "region": "Northwest",      "terrain": "arid"},
    {"id": 40, "city": "Srinagar",      "state": "J&K",              "lat": 34.0837, "lon": 74.7973, "region": "Northwest",      "terrain": "hills"},
    {"id": 41, "city": "Leh",           "state": "Ladakh",           "lat": 34.1526, "lon": 77.5771, "region": "Northwest",      "terrain": "hills"},
]

# Region display order and metadata
REGION_META = {
    "Northwest":       {"icon": "🏔️", "color": "#D97706", "order": 0},
    "Central":         {"icon": "🌾", "color": "#059669", "order": 1},
    "East":            {"icon": "🌊", "color": "#2563EB", "order": 2},
    "Northeast":       {"icon": "🌿", "color": "#16A34A", "order": 3},
    "West":            {"icon": "🏖️", "color": "#7C3AED", "order": 4},
    "South Peninsula": {"icon": "🌴", "color": "#DC2626", "order": 5},
    "Islands":         {"icon": "🏝️", "color": "#0891B2", "order": 6},
}

# Regional climate seasonal defaults (used only if live API is entirely unreachable)
REGION_DEFAULTS = {
    "Northwest":       {"temp": 25.0, "humidity": 45, "apparentTemp": 26.0, "wind": 8.0,  "uv": 5.0, "precipitation": 0.0, "weatherCode": 1},
    "Central":         {"temp": 28.5, "humidity": 40, "apparentTemp": 29.0, "wind": 7.0,  "uv": 6.0, "precipitation": 0.0, "weatherCode": 1},
    "East":            {"temp": 27.0, "humidity": 60, "apparentTemp": 28.5, "wind": 6.0,  "uv": 5.5, "precipitation": 0.0, "weatherCode": 2},
    "Northeast":       {"temp": 23.5, "humidity": 68, "apparentTemp": 24.5, "wind": 5.0,  "uv": 5.0, "precipitation": 0.0, "weatherCode": 2},
    "West":            {"temp": 30.0, "humidity": 55, "apparentTemp": 32.0, "wind": 9.0,  "uv": 6.5, "precipitation": 0.0, "weatherCode": 1},
    "South Peninsula": {"temp": 27.5, "humidity": 68, "apparentTemp": 29.0, "wind": 8.0,  "uv": 6.0, "precipitation": 0.0, "weatherCode": 2},
    "Islands":         {"temp": 27.0, "humidity": 75, "apparentTemp": 29.5, "wind": 11.0, "uv": 6.5, "precipitation": 0.5, "weatherCode": 2},
}

# ═══════════════════════════════════════════════════════════════
# In-memory cache (30 minute TTL)
# ═══════════════════════════════════════════════════════════════
_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 1800  # 30 minutes


# ═══════════════════════════════════════════════════════════════
# Impact-Based Analysis Engine (IMD criteria)
# ═══════════════════════════════════════════════════════════════

def _analyze_impact(station, current, daily_today):
    """Generate IMD-style impact alerts and agriculture advisory for a station."""
    temp = current.get("temp", current.get("temperature_2m"))
    humidity = current.get("humidity", current.get("relative_humidity_2m", 50))
    wind = current.get("wind", current.get("wind_speed_10m", current.get("windspeed_10m", 0)))
    uv = current.get("uv", current.get("uv_index", 0))
    rain_prob = daily_today.get("rain_prob", 0)
    rain_sum = daily_today.get("rain_sum", 0)
    max_temp = daily_today.get("max_temp")
    min_temp = daily_today.get("min_temp")
    terrain = station.get("terrain", "plains")

    alerts = []
    advisory_parts = []
    alert_level = "NORMAL"

    # ── Heat Wave (IMD criteria) ──
    heat_threshold = 30 if terrain == "hills" else 40
    if max_temp is not None:
        if max_temp >= heat_threshold + 5:
            alerts.append({"type": "HEAT_WAVE", "severity": "EXTREME",
                           "message": f"Extreme heat: {max_temp}°C. Dangerous for outdoor work and livestock."})
            advisory_parts.append("🔴 Suspend ALL field work. Provide shade & water to livestock.")
            alert_level = "EXTREME"
        elif max_temp >= heat_threshold:
            alerts.append({"type": "HEAT_WAVE", "severity": "SEVERE",
                           "message": f"Severe heat stress: {max_temp}°C exceeds {heat_threshold}°C threshold."})
            advisory_parts.append("⚠️ Avoid field work 11AM-4PM. Increase irrigation frequency at dawn.")
            alert_level = "SEVERE"

    # ── Cold Wave (Only evaluated if valid temperature data exists) ──
    cold_threshold = 0 if terrain == "hills" else 10
    if min_temp is not None:
        if min_temp <= cold_threshold:
            sev = "SEVERE" if min_temp <= cold_threshold - 5 else "MODERATE"
            alerts.append({"type": "COLD_WAVE", "severity": sev,
                           "message": f"Cold wave: minimum {min_temp}°C. Frost damage risk for crops."})
            advisory_parts.append("❄️ Cover nurseries. Apply mulching to protect roots from frost.")
            if alert_level in ("NORMAL",):
                alert_level = sev

    # ── Heavy Rainfall (IMD classification) ──
    if rain_sum >= 204.5:
        alerts.append({"type": "EXTREMELY_HEAVY_RAIN", "severity": "EXTREME",
                       "message": f"Extremely heavy rain: {rain_sum}mm expected. Flood risk."})
        advisory_parts.append("🌊 Evacuate low-lying fields. Ensure drainage. Do NOT enter waterlogged areas.")
        alert_level = "EXTREME"
    elif rain_sum >= 115.5:
        alerts.append({"type": "VERY_HEAVY_RAIN", "severity": "SEVERE",
                       "message": f"Very heavy rain: {rain_sum}mm expected."})
        advisory_parts.append("🌧️ Delay sowing. Prepare field drainage. Harvest ripe crops immediately.")
        if alert_level not in ("EXTREME",):
            alert_level = "SEVERE"
    elif rain_sum >= 64.5:
        alerts.append({"type": "HEAVY_RAIN", "severity": "HIGH",
                       "message": f"Heavy rain: {rain_sum}mm. Waterlogging possible."})
        advisory_parts.append("🌧️ Delay pesticide application. Check drainage channels.")
        if alert_level in ("NORMAL", "MODERATE"):
            alert_level = "HIGH"
    elif rain_prob > 75:
        alerts.append({"type": "RAIN_LIKELY", "severity": "MODERATE",
                       "message": f"High rain probability: {rain_prob}%. Prepare accordingly."})
        advisory_parts.append("☔ Skip irrigation today. Avoid open-field drying of crops.")
        if alert_level == "NORMAL":
            alert_level = "MODERATE"

    # ── Cyclone proxy (sustained wind + heavy rain) ──
    if wind >= 62 and rain_sum >= 64.5:
        alerts.append({"type": "CYCLONE_RISK", "severity": "EXTREME",
                       "message": f"Cyclonic conditions: wind {wind} km/h with heavy rain."})
        advisory_parts.append("🌀 Secure structures. Move livestock to safety. Follow local authority guidance.")
        alert_level = "EXTREME"
    elif wind >= 50:
        alerts.append({"type": "HIGH_WIND", "severity": "HIGH",
                       "message": f"Strong winds: {wind} km/h. Damage to standing crops possible."})
        advisory_parts.append("💨 Stake tall crops. Secure plastic mulch and shade nets.")
        if alert_level in ("NORMAL", "MODERATE"):
            alert_level = "HIGH"

    # ── UV Index (WHO scale) ──
    if uv >= 11:
        alerts.append({"type": "UV_EXTREME", "severity": "EXTREME",
                       "message": f"UV Index {uv}: Extreme. Burns in <10 minutes."})
    elif uv >= 8:
        alerts.append({"type": "UV_VERY_HIGH", "severity": "HIGH",
                       "message": f"UV Index {uv}: Very High. Limit sun exposure."})

    # ── Flood/Landslide risk for hilly terrain ──
    if terrain == "hills" and rain_sum >= 100:
        alerts.append({"type": "LANDSLIDE_RISK", "severity": "SEVERE",
                       "message": f"Heavy rain ({rain_sum}mm) in hilly terrain. Landslide risk."})
        advisory_parts.append("⛰️ Avoid hill slopes. Watch for soil erosion in terraced fields.")

    # ── Pest risk from humidity ──
    curr_temp = temp if temp is not None else 25
    if humidity > 85 and curr_temp > 25:
        advisory_parts.append("🐛 High pest/fungal risk. Apply preventive neem spray. Inspect crops daily.")
    elif humidity > 70 and curr_temp > 20:
        advisory_parts.append("🔍 Moderate pest conditions. Monitor for early signs of infestation.")

    # ── Default advisory ──
    if not advisory_parts:
        advisory_parts.append("✅ Conditions normal. Maintain regular farming schedule.")

    return alerts, " | ".join(advisory_parts), alert_level


# ═══════════════════════════════════════════════════════════════
# High-Efficiency Batch Weather Fetcher
# ═══════════════════════════════════════════════════════════════

def fetch_stations_batch(stations):
    """Fetch forecast for a list of stations in a single batch request to avoid rate limits."""
    lats = ",".join(str(s["lat"]) for s in stations)
    lons = ",".join(str(s["lon"]) for s in stations)
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lats}&longitude={lons}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,"
        f"weathercode,wind_speed_10m,uv_index,precipitation"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,"
        f"precipitation_probability_max,wind_speed_10m_max,weathercode,uv_index_max"
        f"&timezone=Asia/Kolkata"
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'PlantTalkAI/2.0'})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode('utf-8'))
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict):
                    return [data]
        except Exception as e:
            print(f"Batch fetch attempt {attempt + 1} failed: {e}")
            time.sleep(0.8)
    return None


def fetch_all_stations_data():
    """Fetches all 42 stations in 1 batch request, with chunked fallback."""
    # Attempt 1: Fetch all 42 in a single batch request
    data = fetch_stations_batch(INDIA_STATIONS)
    if data and len(data) == len(INDIA_STATIONS):
        valid_count = sum(1 for d in data if isinstance(d, dict) and d.get("current", {}).get("temperature_2m") is not None)
        if valid_count > len(INDIA_STATIONS) * 0.5:
            return data

    # Attempt 2: If single batch failed, fetch in 2 smaller chunks of 21
    print("Single batch incomplete, attempting 2 chunks of 21...")
    chunk_size = 21
    combined = []
    for i in range(0, len(INDIA_STATIONS), chunk_size):
        chunk = INDIA_STATIONS[i:i + chunk_size]
        res = fetch_stations_batch(chunk)
        if res and len(res) == len(chunk):
            combined.extend(res)
        else:
            combined.extend([{}] * len(chunk))
        time.sleep(0.5)

    if any(isinstance(d, dict) and d.get("current", {}).get("temperature_2m") is not None for d in combined):
        return combined

    return None


# ═══════════════════════════════════════════════════════════════
# Main Forecast Generator
# ═══════════════════════════════════════════════════════════════

def generate_india_forecast(force_refresh=False):
    """Fetch weather for all 42 stations and generate impact-based forecast."""

    # Check cache
    now = time.time()
    if not force_refresh and _cache["data"] and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["data"]

    all_station_data = fetch_all_stations_data()

    # If completely failed to fetch and we have existing cache, return it
    if not all_station_data and _cache["data"]:
        print("Using cached India forecast data")
        return _cache["data"]

    if all_station_data is None:
        all_station_data = [{}] * len(INDIA_STATIONS)

    try:
        regions_map = {}

        for idx, station in enumerate(INDIA_STATIONS):
            sd = all_station_data[idx] if idx < len(all_station_data) else {}
            current = sd.get("current", {}) if isinstance(sd, dict) else {}
            daily = sd.get("daily", {}) if isinstance(sd, dict) else {}

            reg = station["region"]
            reg_default = REGION_DEFAULTS.get(reg, REGION_DEFAULTS["Central"])

            # Temperature values (fallback to regional defaults if API omitted)
            raw_temp = current.get("temperature_2m")
            temp = round(float(raw_temp), 1) if raw_temp is not None else reg_default["temp"]
            
            raw_humidity = current.get("relative_humidity_2m")
            humidity = round(float(raw_humidity)) if raw_humidity is not None else reg_default["humidity"]

            raw_apparent = current.get("apparent_temperature")
            apparent_temp = round(float(raw_apparent), 1) if raw_apparent is not None else reg_default["apparentTemp"]

            wind_val = current.get("wind_speed_10m", current.get("windspeed_10m"))
            wind = round(float(wind_val), 1) if wind_val is not None else reg_default["wind"]

            raw_uv = current.get("uv_index")
            uv = round(float(raw_uv), 1) if raw_uv is not None else reg_default["uv"]

            raw_precip = current.get("precipitation")
            precipitation = round(float(raw_precip), 1) if raw_precip is not None else reg_default["precipitation"]

            weather_code = current.get("weathercode", reg_default["weatherCode"])

            # Daily data
            daily_max_list = daily.get("temperature_2m_max") or []
            daily_min_list = daily.get("temperature_2m_min") or []
            daily_rain_list = daily.get("precipitation_sum") or []
            daily_prob_list = daily.get("precipitation_probability_max") or []
            daily_wind_list = daily.get("wind_speed_10m_max") or []
            daily_uv_list = daily.get("uv_index_max") or []

            daily_today = {
                "max_temp": daily_max_list[0] if len(daily_max_list) > 0 and daily_max_list[0] is not None else round(temp + 2.5, 1),
                "min_temp": daily_min_list[0] if len(daily_min_list) > 0 and daily_min_list[0] is not None else round(temp - 4.0, 1),
                "rain_sum": daily_rain_list[0] if len(daily_rain_list) > 0 and daily_rain_list[0] is not None else 0,
                "rain_prob": daily_prob_list[0] if len(daily_prob_list) > 0 and daily_prob_list[0] is not None else 0,
                "wind_max": daily_wind_list[0] if len(daily_wind_list) > 0 and daily_wind_list[0] is not None else wind,
                "uv_max": daily_uv_list[0] if len(daily_uv_list) > 0 and daily_uv_list[0] is not None else uv,
            }

            # Build 7-day forecast
            forecast_days = []
            times = daily.get("time", [])
            for i in range(len(times)):
                try:
                    day_obj = datetime.strptime(times[i], "%Y-%m-%d")
                    forecast_days.append({
                        "day": day_obj.strftime("%a"),
                        "date": times[i],
                        "maxTemp": daily_max_list[i] if i < len(daily_max_list) and daily_max_list[i] is not None else round(temp + 2.5, 1),
                        "minTemp": daily_min_list[i] if i < len(daily_min_list) and daily_min_list[i] is not None else round(temp - 4.0, 1),
                        "rain": daily_rain_list[i] if i < len(daily_rain_list) and daily_rain_list[i] is not None else 0,
                        "rainChance": daily_prob_list[i] if i < len(daily_prob_list) and daily_prob_list[i] is not None else 0,
                        "wind": daily_wind_list[i] if i < len(daily_wind_list) and daily_wind_list[i] is not None else wind,
                        "weatherCode": (daily.get("weathercode") or [])[i] if i < len(daily.get("weathercode") or []) else weather_code,
                    })
                except Exception:
                    continue

            # Impact analysis
            current_dict = {
                "temp": temp,
                "humidity": humidity,
                "apparentTemp": apparent_temp,
                "wind": wind,
                "uv": uv,
                "precipitation": precipitation,
                "weatherCode": weather_code,
            }
            alerts, advisory, severity = _analyze_impact(station, current_dict, daily_today)

            if reg not in regions_map:
                meta = REGION_META.get(reg, {"icon": "📍", "color": "#666", "order": 99})
                regions_map[reg] = {
                    "name": reg,
                    "icon": meta["icon"],
                    "color": meta["color"],
                    "order": meta["order"],
                    "stations": [],
                    "summary": {"avgTemp": 0, "maxTemp": 0, "avgHumidity": 0, "alertLevel": "NORMAL", "totalAlerts": 0}
                }

            regions_map[reg]["stations"].append({
                "city": station["city"],
                "state": station["state"],
                "terrain": station["terrain"],
                "current": current_dict,
                "forecast": forecast_days,
                "alerts": alerts,
                "alertLevel": severity,
                "agri_advisory": advisory,
            })

        # ── Calculate region summaries ──
        severity_order = {"NORMAL": 0, "MODERATE": 1, "HIGH": 2, "SEVERE": 3, "EXTREME": 4}

        for reg in regions_map.values():
            stations = reg["stations"]
            if not stations:
                continue
            temps = [s["current"]["temp"] for s in stations if s["current"]["temp"] is not None]
            humids = [s["current"]["humidity"] for s in stations if s["current"]["humidity"] is not None]
            total_alerts = sum(len(s["alerts"]) for s in stations)
            worst = max(stations, key=lambda s: severity_order.get(s["alertLevel"], 0))

            reg["summary"] = {
                "avgTemp": round(sum(temps) / len(temps), 1) if temps else 25.0,
                "maxTemp": round(max(temps), 1) if temps else 28.0,
                "minTemp": round(min(temps), 1) if temps else 20.0,
                "avgHumidity": round(sum(humids) / len(humids)) if humids else 50,
                "alertLevel": worst["alertLevel"],
                "totalAlerts": total_alerts,
                "stationCount": len(stations),
            }

        # Sort regions by order
        sorted_regions = sorted(regions_map.values(), key=lambda r: r["order"])

        result = {
            "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:30"),
            "model_sources": ["GFS", "ECMWF IFS", "JMA", "ICON", "GEM", "Open-Meteo Ensemble"],
            "station_count": len(INDIA_STATIONS),
            "regions": sorted_regions,
        }

        # Only cache if data has valid positive temperatures
        if any(r["summary"]["avgTemp"] > 0 for r in sorted_regions):
            _cache["data"] = result
            _cache["timestamp"] = now

        return result

    except Exception as e:
        print(f"India forecast error: {e}")
        if _cache["data"]:
            return _cache["data"]
        return {"error": str(e), "regions": []}
