import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

/**
 * LocationSearch component
 * 
 * Ultra-precise location search using 3-API fallback chain:
 * 1. Open-Meteo Geocoding (fast, covers most places)
 * 2. Nominatim free-text search with "+India" 
 * 3. Nominatim structured search (city + country=India)
 * 
 * Supports regional language input (Tamil, Hindi, etc.)
 * Shows recent locations as quick chips.
 */
export const LocationSearch = ({ onLocationSelected, currentLocation }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent locations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentLocations');
      if (stored) {
        setRecentLocations(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent locations:', e);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Detect if text contains non-Latin characters (regional language)
  const isRegionalScript = (text) => {
    return /[^\u0000-\u007F]/.test(text);
  };

  // ─── API 1: Open-Meteo Geocoding ───
  const searchOpenMeteo = async (text) => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=10&language=en`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) return [];
      
      // Filter for India results only
      return data.results
        .filter(r => r.country_code === 'IN' || r.country === 'India')
        .map(r => ({
          id: `om-${r.id}`,
          name: r.name,
          district: r.admin2 || r.admin3 || '',
          state: r.admin1 || '',
          country: r.country || 'India',
          latitude: r.latitude,
          longitude: r.longitude,
          source: 'open-meteo',
        }));
    } catch (err) {
      console.error('Open-Meteo geocoding error:', err);
      return [];
    }
  };

  // ─── API 2: Nominatim free-text search ───
  const searchNominatimFreeText = async (text) => {
    try {
      // If regional script, use that language + English
      const acceptLang = isRegionalScript(text) ? 'ta,hi,kn,te,ml,en' : 'en';
      const searchQuery = isRegionalScript(text) ? text : `${text} India`;
      
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=10&addressdetails=1&accept-language=${acceptLang}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PlantTalkAI/1.0' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      
      if (!data || data.length === 0) return [];
      
      return data
        .filter(r => {
          const addr = r.address || {};
          return addr.country_code === 'in' || addr.country === 'India';
        })
        .map(r => parseNominatimResult(r, 'nominatim-free'));
    } catch (err) {
      console.error('Nominatim free-text error:', err);
      return [];
    }
  };

  // ─── API 3: Nominatim structured search ───
  const searchNominatimStructured = async (text) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(text)}&country=India&format=json&limit=10&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PlantTalkAI/1.0' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      
      if (!data || data.length === 0) return [];
      
      return data.map(r => parseNominatimResult(r, 'nominatim-struct'));
    } catch (err) {
      console.error('Nominatim structured error:', err);
      return [];
    }
  };

  // Parse a Nominatim result into our format
  const parseNominatimResult = (r, source) => {
    const addr = r.address || {};
    const name = addr.city || addr.town || addr.village || addr.suburb ||
                 addr.hamlet || addr.county || addr.municipality ||
                 r.display_name.split(',')[0].trim();
    const district = addr.county || addr.state_district || addr.district || '';
    const state = addr.state || '';
    
    return {
      id: `${source}-${r.place_id}`,
      name: name,
      district: district,
      state: state,
      country: 'India',
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      displayName: r.display_name,
      source: source,
    };
  };

  // Deduplicate results by lat/lon proximity
  const deduplicateResults = (allResults) => {
    const unique = [];
    const seen = new Set();
    
    for (const result of allResults) {
      // Round to 2 decimal places for dedup
      const key = `${result.name.toLowerCase()}-${Math.round(result.latitude * 100)}-${Math.round(result.longitude * 100)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }
    
    return unique;
  };

  // Main search function with fallback chain
  const performSearch = useCallback(async (text) => {
    if (!text || text.trim().length < 3) {
      setResults([]);
      setNoResults(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setNoResults(false);
    setShowDropdown(true);

    let allResults = [];

    // API 1: Open-Meteo
    console.log(`🔍 Searching Open-Meteo for: "${text}"`);
    const openMeteoResults = await searchOpenMeteo(text);
    allResults = [...openMeteoResults];
    console.log(`  Open-Meteo found: ${openMeteoResults.length} results`);

    // API 2: Nominatim free-text (if API 1 found few results)
    if (allResults.length < 3) {
      console.log(`🔍 Searching Nominatim free-text for: "${text}"`);
      const nominatimResults = await searchNominatimFreeText(text);
      allResults = [...allResults, ...nominatimResults];
      console.log(`  Nominatim free-text found: ${nominatimResults.length} results`);
    }

    // API 3: Nominatim structured (if still few results)
    if (allResults.length < 3) {
      console.log(`🔍 Searching Nominatim structured for: "${text}"`);
      const structuredResults = await searchNominatimStructured(text);
      allResults = [...allResults, ...structuredResults];
      console.log(`  Nominatim structured found: ${structuredResults.length} results`);
    }

    // Deduplicate
    const uniqueResults = deduplicateResults(allResults);
    console.log(`📍 Total unique results: ${uniqueResults.length}`);

    setResults(uniqueResults);
    setNoResults(uniqueResults.length === 0);
    setIsSearching(false);
  }, []);

  // Debounced search trigger
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        performSearch(value.trim());
      }, 400);
    } else {
      setResults([]);
      setNoResults(false);
      setShowDropdown(false);
    }
  };

  // Handle location selection
  const handleSelect = (location) => {
    const locationData = {
      locationName: location.name,
      district: location.district,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      selectedAt: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem('selectedLocation', JSON.stringify(locationData));

    // Update recent locations
    const updatedRecent = [
      locationData,
      ...recentLocations.filter(
        r => !(r.locationName === locationData.locationName && r.state === locationData.state)
      )
    ].slice(0, 5);
    setRecentLocations(updatedRecent);
    localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));

    // Close dropdown
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setNoResults(false);

    // Console log for verification
    console.log(`✅ ${location.name} found:`, {
      lat: location.latitude,
      lon: location.longitude,
      state: location.state,
      district: location.district,
    });

    // Trigger parent callback
    if (onLocationSelected) {
      onLocationSelected(locationData);
    }

    // Show toast
    setToast(`✅ Weather updated for ${location.name}`);
  };

  // Handle recent location click
  const handleRecentClick = (recent) => {
    console.log(`🕐 Loading recent: ${recent.locationName}`);
    if (onLocationSelected) {
      onLocationSelected({ ...recent, selectedAt: Date.now() });
    }
    setToast(`✅ Weather updated for ${recent.locationName}`);
  };

  // Format display label for dropdown
  const formatLabel = (r) => {
    const parts = [r.name];
    if (r.district) parts.push(r.district);
    if (r.state) parts.push(r.state);
    return parts.join(', ');
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
        <input
          id="location-search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || noResults) setShowDropdown(true);
          }}
          placeholder={t('Search any place in India...')}
          className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-outline"
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Current Location Display */}
      {currentLocation && !showDropdown && (
        <div className="mt-2 flex items-center gap-2 text-sm text-primary font-medium">
          <span>📍</span>
          <span>{currentLocation}</span>
        </div>
      )}

      {/* Recent Locations Chips */}
      {recentLocations.length > 0 && !showDropdown && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recentLocations.map((r, idx) => (
            <button
              key={`recent-${idx}`}
              onClick={() => handleRecentClick(r)}
              className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30 transition-all hover:bg-white/20 hover:border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:scale-95"
            >
              <span>🕐</span>
              <span>{r.locationName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-outline-variant/40 rounded-xl shadow-modal max-h-72 overflow-y-auto">
          {isSearching && (
            <div className="flex items-center gap-3 p-4 text-gray-100">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Searching places...</span>
            </div>
          )}

          {!isSearching && noResults && (
            <div className="p-4 text-center">
              <p className="text-sm text-error font-medium">
                ❌ Location not found.
              </p>
              <p className="text-xs text-gray-100 mt-1">
                Try spelling differently or try nearby city name.
              </p>
            </div>
          )}

          {!isSearching && results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-secondary-container/20 transition-colors border-b border-outline-variant/10 last:border-b-0 flex items-start gap-2.5"
            >
              <span className="text-primary mt-0.5 flex-shrink-0">📍</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {r.name}
                </p>
                <p className="text-xs text-gray-100 truncate">
                  {[r.district, r.state].filter(Boolean).join(', ')}
                </p>
              </div>
              <span className="text-[10px] text-outline ml-auto flex-shrink-0 mt-1 bg-surface-variant px-1.5 py-0.5 rounded">
                {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-on-primary px-5 py-3 rounded-xl shadow-modal text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
};
