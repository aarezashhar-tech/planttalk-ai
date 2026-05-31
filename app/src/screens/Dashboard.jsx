import React, { useState, useEffect } from 'react';
import { WateringSchedule } from '../components/WateringSchedule';
import { LocationSearch } from '../components/LocationSearch';
import { useTranslation } from '../contexts/LanguageContext';
import { useForecast } from '../hooks/useForecast';

export const Dashboard = ({ backendData, userProfile, onLocationSelected, locationForecast }) => {
  const { t } = useTranslation();
  const { weather, insights, isLoading, error, waitingForLocation } = backendData;
  const { temperature, humidity, rainChance, locationName, apparentTemperature } = weather || {};
  const crop = userProfile?.crop || 'Crop';
  const lat = userProfile?.latitude;
  const lon = userProfile?.longitude;

  const [soilData, setSoilData] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);

  useEffect(() => {
    if (lat && lon) {
      setSoilLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/soil?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          setSoilData(data);
          setSoilLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch soil data:", err);
          setSoilLoading(false);
        });
    }
  }, [lat, lon]);

  const getSoilStatus = (val, type) => {
    if (!val) return { label: '--', color: 'text-gray-100' };
    if (type === 'ph') {
      if (val < 5.5) return { label: 'Low', color: 'text-error' };
      if (val > 7.5) return { label: 'High', color: 'text-error' };
      return { label: 'Optimal', color: 'text-primary' };
    }
    // Simple NPK thresholds for demonstration
    if (val < 20) return { label: 'Low', color: 'text-error' };
    if (val > 80) return { label: 'High', color: 'text-tertiary-container' };
    return { label: 'Good', color: 'text-primary' };
  };

  const pestInfo = insights ? {
    level: insights.pestRisk,
    pest: t('Based on weather model'),
    action: insights.action,
    color: insights.pestRisk.includes('CRITICAL') ? 'text-error' : insights.pestRisk.includes('HIGH') ? 'text-tertiary-container' : 'text-primary'
  } : { level: '--', pest: '--', action: '--', color: 'text-gray-100' };
  
  // Header Greetings and Stats
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('Good Morning') : hour < 18 ? t('Good Afternoon') : t('Good Evening');
  const sowDate = userProfile?.sowDate ? new Date(userProfile.sowDate) : new Date();
  const daysSince = Math.floor((new Date() - sowDate) / (1000 * 60 * 60 * 24));
  
  // Use location forecast if available, otherwise fall back to backend forecast
  const { forecast: backendForecast } = useForecast(userProfile?.user_id);
  const forecast = locationForecast && locationForecast.length > 0 ? locationForecast : backendForecast;

  // Compute next rainy day summary from forecast
  const nextRainDay = forecast.find(d => d.rain > 0);
  const rainSummary = nextRainDay
    ? `🌧️ Rain expected ${nextRainDay.day} — ${Math.round(nextRainDay.rain * 10) / 10}mm`
    : null;

  // Get display location name
  const displayLocation = locationName || userProfile?.location || 'Set Location';

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <header className="mb-6 animate-slide-down">
        <h1 className="text-headline-lg-mobile text-primary">{greeting}, {userProfile?.farmerName} 🌾</h1>
        <p className="text-body-md text-gray-100 font-medium mt-1">
          {crop} Farm • {userProfile?.farmSize} acres
        </p>
        <div className="flex gap-2 mt-3">
          <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1.5 rounded-full">
            🌱 {userProfile?.growthStage} Stage
          </span>
          <span className="bg-surface-variant text-gray-100 text-xs font-bold px-3 py-1.5 rounded-full">
            Day {daysSince > 0 ? daysSince : 1} of growing season
          </span>
        </div>
      </header>

      {/* Location Search */}
      <div className="glass-card p-4 animate-pop-up stagger-1 card-hover">
        <h2 className="text-label-md text-gray-100 uppercase tracking-wider mb-3">
          📍 {t('Your Location')}
        </h2>
        <LocationSearch
          onLocationSelected={onLocationSelected}
          currentLocation={displayLocation}
        />
      </div>

      {/* Weather Card */}
      <div className="glass-card p-6 relative overflow-hidden animate-pop-up stagger-2 card-hover">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-label-md text-gray-100 uppercase tracking-wider">{t('Live Weather')}</h2>
          <span className="text-xs bg-surface-variant px-2 py-1 rounded-md text-gray-100 font-medium flex items-center gap-1">
            📍 {displayLocation}
          </span>
        </div>
        
        {isLoading ? (
          <div className="skeleton-shimmer h-16 w-3/4"></div>
        ) : weather?.success === false ? (
          <div className="text-error font-medium p-4 bg-error/10 rounded-lg">
            ⚠️ Weather Error: {weather.error}
          </div>
        ) : (
          <div className="flex justify-between items-end">
            <div>
              <div className="text-display-lg text-primary">{temperature}°<span className="text-headline-md">C</span></div>
              {apparentTemperature != null && (
                <p className="text-body-lg text-white font-semibold mb-1">Feels Like: {apparentTemperature}°C</p>
              )}
              <p className="text-body-md text-gray-100 mt-1">Humidity: {humidity}% • Rain: {rainChance}%</p>
              {weather?.windSpeed != null && (
                <p className="text-body-md text-gray-100">
                  Wind: {weather.windSpeed} km/h
                  {weather.uvIndex != null && ` • UV: ${weather.uvIndex}`}
                </p>
              )}
            </div>
            <div className="text-5xl font-bold pb-2">
              {rainChance > 50 ? '🌧️' : temperature > 30 ? '☀️' : '⛅'}
            </div>
          </div>
        )}
      </div>

      {/* Rain Summary Banner */}
      {rainSummary && (
        <div className="glass-card p-3 flex items-center gap-3 border-l-4 border-l-primary animate-slide-left stagger-3">
          <span className="text-xl">🌧️</span>
          <p className="text-body-md text-primary font-medium">{rainSummary}</p>
        </div>
      )}

      <WateringSchedule weather={weather} userProfile={userProfile} />

      {/* Grid for Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pest Risk */}
        <div className="glass-card p-4 col-span-2 sm:col-span-1 animate-pop-up stagger-4 card-hover">
          <div className="text-2xl font-bold mb-2">🐛</div>
          <h3 className="text-label-sm text-gray-100 mb-1">{t('Pest Risk')}</h3>
          <p className={`text-headline-md ${pestInfo.color}`}>{isLoading ? '--' : pestInfo.level}</p>
          <div className="mt-2 text-xs bg-surface-variant/50 p-2 rounded">
            <span className="font-bold block">{pestInfo.pest}</span>
            <span className="text-gray-100">{pestInfo.action}</span>
          </div>
        </div>

        {/* Crop Health Status */}
        <div className="glass-card p-4 col-span-2 sm:col-span-1 flex flex-col justify-center animate-pop-up stagger-5 card-hover">
          <div className="text-2xl font-bold mb-2">🌿</div>
          <h3 className="text-label-sm text-gray-100 mb-1">{t('Overall Health')}</h3>
          <p className="text-headline-md text-primary">{isLoading ? '--' : (insights?.health || 'FAIR 🟡')}</p>
        </div>
      </div>

      {/* Soil Profile Card */}
      <div className="glass-card p-4 animate-pop-up stagger-6 card-hover">
        <h3 className="text-label-md text-gray-100 uppercase tracking-wider mb-3">🌍 Soil Profile (ISRIC)</h3>
        {soilLoading ? (
          <div className="skeleton-shimmer h-16 w-full rounded"></div>
        ) : soilData ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-surface-variant/30 p-2 rounded-lg">
              <p className="text-xs text-gray-100">pH</p>
              <p className="text-lg font-bold">{soilData.ph ? soilData.ph.toFixed(1) : '--'}</p>
              <p className={`text-[10px] font-bold uppercase ${getSoilStatus(soilData.ph, 'ph').color}`}>{getSoilStatus(soilData.ph, 'ph').label}</p>
            </div>
            <div className="bg-surface-variant/30 p-2 rounded-lg">
              <p className="text-xs text-gray-100">Nitrogen</p>
              <p className="text-lg font-bold">{soilData.n ? Math.round(soilData.n) : '--'}</p>
              <p className={`text-[10px] font-bold uppercase ${getSoilStatus(soilData.n, 'npk').color}`}>{getSoilStatus(soilData.n, 'npk').label}</p>
            </div>
            <div className="bg-surface-variant/30 p-2 rounded-lg">
              <p className="text-xs text-gray-100">Phosphorus</p>
              <p className="text-lg font-bold">{soilData.p ? Math.round(soilData.p) : '--'}</p>
              <p className={`text-[10px] font-bold uppercase ${getSoilStatus(soilData.p, 'npk').color}`}>{getSoilStatus(soilData.p, 'npk').label}</p>
            </div>
            <div className="bg-surface-variant/30 p-2 rounded-lg">
              <p className="text-xs text-gray-100">Potassium</p>
              <p className="text-lg font-bold">{soilData.k ? Math.round(soilData.k) : '--'}</p>
              <p className={`text-[10px] font-bold uppercase ${getSoilStatus(soilData.k, 'npk').color}`}>{getSoilStatus(soilData.k, 'npk').label}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-100">Set a location to view soil data.</p>
        )}
      </div>

      {/* Soil & Additional Info (when location weather is available) */}
      {weather?.soilTemperature != null && (
        <div className="glass-card p-4 animate-pop-up stagger-6 card-hover">
          <h3 className="text-label-md text-gray-100 uppercase tracking-wider mb-3">🌡️ Soil Conditions</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-variant/30 p-3 rounded-lg">
              <p className="text-xs text-gray-100">Soil Temperature</p>
              <p className="text-lg font-bold text-primary">{weather.soilTemperature}°C</p>
            </div>
            <div className="bg-surface-variant/30 p-3 rounded-lg">
              <p className="text-xs text-gray-100">Avg Humidity Today</p>
              <p className="text-lg font-bold text-primary">{weather.avgHumidityToday || humidity}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
