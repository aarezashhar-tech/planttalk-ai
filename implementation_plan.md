# Full-Stack Integration Plan: Python Backend & AI Relocation

This plan outlines the architecture for migrating the current React mock state to a full-stack SQLite + Python backend, serving the application's AI insights dynamically.

## User Review Required

> [!WARNING]  
> The prompt mentions querying `weather_client.py` for live weather. However, **`weather_client.py` does not currently exist** in the workspace. I will create a robust `weather_client.py` module using the `requests` library to fetch from the Open-Meteo API (the same one previously used by the React hook). **If you intended for me to use a specific existing file, please let me know or supply it.**

## Proposed Changes

### Backend Infrastructure

#### [NEW] `backend/database.py`
- Initialize `sqlite3` connection to a new `planttalk.db`.
- **`users` table**: `id` (INTEGER PK AUTOINCREMENT), `auth_provider` (TEXT), `contact_info` (TEXT).
- **`profiles` table**: `user_id` (INTEGER FK), `name` (TEXT), `location` (TEXT), `crop` (TEXT), `language_pref` (TEXT).
- Implement CRUD helper functions (`create_user`, `update_profile`, `get_profile`).

#### [NEW] `backend/weather_client.py`
- Expose a `get_live_weather(location_name)` function.
- Will perform geocoding (location -> lat/lon) and then fetch current temperature, humidity, and rain probabilities from Open-Meteo.

#### [NEW] `backend/ai_engine.py`
- **Goal**: Move heuristic logic out of React.
- `generate_crop_insights(temp, humidity, crop_type, language)`
- Will port the Python equivalent of the translation dictionaries to ensure the backend returns fully localized string outputs directly to the frontend as requested.

#### [NEW] `backend/server.py`
- Implement a custom `http.server.BaseHTTPRequestHandler`.
- Add CORS headers so the Vite frontend (port 5173) can communicate with the backend (port 8000).
- **Endpoints**:
  - `POST /api/auth`: Create/lookup user, return `{ "user_id": 1 }`.
  - `POST /api/profile`: Accept JSON (name, crop, location, language) and save to `profiles`.
  - `GET /api/insights?user_id={id}`: Look up location, query `weather_client.py`, pass to `ai_engine.py`, and return the translated strings.

---

### Frontend Modifications

#### [MODIFY] `src/screens/Auth.jsx` & `Onboarding.jsx`
- Complete string translation using `LanguageContext`.
- Replace `localStorage` mock writes with `fetch('http://localhost:8000/api/auth')` and `fetch('http://localhost:8000/api/profile')`. Store the returned `user_id` in localStorage.

#### [MODIFY] `src/screens/Dashboard.jsx` & `ForecastPest.jsx` & `AIInsights.jsx`
- Complete string translation using `LanguageContext`.
- Refactor the components to fetch the unified payload from `GET /api/insights?user_id=X` rather than relying on the frontend `useWeather` hook.

#### [MODIFY] `src/screens/Settings.jsx`
- Ensure updating the language fires a `POST /api/profile` request to sync the backend's `language_pref`.

## Verification Plan

### Automated Tests
- Run `server.py` and execute simple `curl` requests to verify endpoints `/api/auth` and `/api/insights` handle SQLite operations successfully without 500 errors.

### Manual Verification
- Run `npm run dev`.
- I will use the `browser_subagent` to log in, complete onboarding, and verify that the Dashboard correctly displays backend-generated, translated insights. I will capture a screenshot of the Dashboard.
