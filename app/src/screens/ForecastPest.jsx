import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const ForecastPest = ({ backendData, userProfile, locationForecast }) => {
  const { t } = useTranslation();
  const { weather, isLoading } = backendData || {};
  const { temperature, humidity, rainChance } = weather || {};
  const crop = userProfile?.crop || 'Crop';
  const growthStage = userProfile?.growthStage || 'Vegetative';
  
  const [forecastData, setForecastData] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(true);

  useEffect(() => {
    // Prefer location forecast if available
    if (locationForecast && locationForecast.length > 0) {
      setForecastData(locationForecast);
      setLoadingForecast(false);
      return;
    }

    const fetchForecast = async () => {
      const sessionStr = localStorage.getItem('userProfile');
      if (!sessionStr) {
        setLoadingForecast(false);
        return;
      }
      const userId = JSON.parse(sessionStr).user_id;
      
      if (!userId || userId === 'undefined') {
        setLoadingForecast(false);
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/forecast?user_id=${userId}`);
        const data = await response.json();
        setForecastData(data.forecast || []);
      } catch (e) {
        console.error("Forecast fetch error", e);
      } finally {
        setLoadingForecast(false);
      }
    };
    fetchForecast();
  }, [locationForecast]);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fade-in">
      <header className="mb-6 animate-slide-down">
        <h1 className="text-headline-lg-mobile text-primary">{t('7-Day Forecast')} 📈</h1>
        <p className="text-body-md text-gray-100 font-medium mt-1">
          {t('Pest risk and weather trends for')} {crop}
        </p>
        {weather?.locationName && (
          <p className="text-xs text-primary font-medium mt-1">
            📍 {weather.locationName}
          </p>
        )}
      </header>

      <div className="glass-card p-6 animate-pop-up stagger-1 card-hover">
        <h2 className="text-label-md text-gray-100 uppercase tracking-wider mb-4">{t('Current Risk Factors')}</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg">
            <span className="text-white">{t('Temp')}</span>
            <span className="font-bold text-primary">{isLoading ? '--' : temperature}°C</span>
          </div>
          <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg">
            <span className="text-white">Humidity</span>
            <span className="font-bold text-primary">{isLoading ? '--' : humidity}%</span>
          </div>
          <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg">
            <span className="text-white">{t('Rain')} Probability</span>
            <span className="font-bold text-primary">{isLoading ? '--' : rainChance}%</span>
          </div>
          {weather?.windSpeed != null && (
            <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg">
              <span className="text-white">Wind Speed</span>
              <span className="font-bold text-primary">{weather.windSpeed} km/h</span>
            </div>
          )}
          {weather?.uvIndex != null && (
            <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg">
              <span className="text-white">UV Index</span>
              <span className="font-bold text-primary">{weather.uvIndex}</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden border-outline-variant/30 animate-pop-up stagger-3 card-hover">
        <div className="bg-surface-variant/20 p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="text-label-md text-gray-100 uppercase tracking-wider">{t('7-Day Forecast')}</h2>
        </div>
        
        <div className="p-4 overflow-x-auto">
          {loadingForecast ? (
            <div className="text-center py-4 text-gray-100">{t('Loading forecast...')}</div>
          ) : forecastData.length === 0 ? (
            <div className="text-center py-4 text-gray-100">{t('No forecast available')}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/40 text-label-sm text-gray-100 uppercase">
                  <th className="py-2 pr-2">{t('Day')}</th>
                  <th className="py-2 px-2">{t('Temp')}</th>
                  <th className="py-2 px-2">{t('Rain')}</th>
                  <th className="py-2 px-2 text-right">{t('Wind')}</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-white">
                {forecastData.map((day, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/20 last:border-0">
                    <td className="py-3 pr-2 font-medium">{day.day}</td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="text-error">{Math.round(day.maxTemp)}°</span> / <span className="text-primary">{Math.round(day.minTemp)}°</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {day.rain > 5 ? '🌧️' : day.rain > 0 ? '🌦️' : '☀️'}
                        <span className="text-xs text-gray-100 ml-1">{Math.round(day.rain)}mm</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-100 text-sm whitespace-nowrap">
                      {Math.round(day.wind)} km/h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
