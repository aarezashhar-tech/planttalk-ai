import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useForecast, getDayAdvice } from '../hooks/useForecast';

export const AIInsights = ({ backendData, userProfile, locationForecast }) => {
  const { t } = useTranslation();
  const { weather, insights, isLoading } = backendData;
  const { temperature, humidity, rainChance } = weather || {};
  const [showForecast, setShowForecast] = useState(false);

  const crop = userProfile?.crop || 'Crop';
  const yieldTarget = userProfile?.yieldTarget || 1000;
  const userId = userProfile?.user_id;

  const { forecast: backendForecast, isLoading: forecastLoading } = useForecast(userId);
  const forecast = locationForecast && locationForecast.length > 0 ? locationForecast : backendForecast;

  const aiData = insights || {
    summary: t("Analyzing latest field conditions..."),
    action: t("Please wait")
  };

  const expectedYield = Math.round(yieldTarget * (temperature > 35 ? 0.85 : 0.95));
  const getMarketTip = () => {
    if (crop === 'Rice' || crop === 'Wheat') return "Prices usually peak 2 months after harvest season. Consider cold storage if possible.";
    if (['Tomato', 'Onion', 'Potato'].includes(crop)) return "High volatility right now. Check local mandi rates daily.";
    return `Best time to sell ${crop} is usually during festival season.`;
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fade-in">
      <header className="mb-6 animate-slide-down">
        <h1 className="text-headline-lg-mobile text-primary">Verdant Intelligence</h1>
        <p className="text-body-md text-gray-100">{t('AI-powered farming recommendations')}</p>
      </header>

      {/* Main AI Insight Card */}
      <div className="glass-card overflow-hidden animate-pop-up stagger-1 card-hover">
        <div className="bg-primary/5 p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary text-2xl font-bold shadow-md">
              ✨
            </div>
            <div>
              <h2 className="text-label-md text-primary font-bold uppercase tracking-wide">{t('Daily Advisory')}</h2>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-outline-variant/20 space-y-2">
            <p className="text-body-md text-gray-100 font-medium">
              <span className="font-bold text-primary">{t('Summary')}:</span> {aiData.summary}
            </p>
            <p className="text-headline-md text-primary leading-tight">
              <span className="text-body-md font-bold block">{t('Recommended Action')}:</span>
              {aiData.action}
            </p>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-4 flex items-start gap-3 animate-pop-up stagger-2 card-hover">
          <div className="text-3xl font-bold">🧪</div>
          <div>
            <h3 className="text-label-md font-bold text-primary">Fertilizer Guide</h3>
            <p className="text-body-md text-gray-100">
              Since you are in the <b>{userProfile?.growthStage}</b> stage, apply NPK (Nitrogen rich) this week to boost growth.
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-start gap-3 animate-pop-up stagger-3 card-hover">
          <div className="text-3xl font-bold">📈</div>
          <div>
            <h3 className="text-label-md font-bold text-primary">Yield Prediction</h3>
            <p className="text-body-md text-gray-100">
              Based on current conditions, expected yield is <span className="font-bold text-primary">{expectedYield} kg/acre</span> (Target: {yieldTarget}).
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-start gap-3 animate-pop-up stagger-4 card-hover">
          <div className="text-3xl font-bold">💰</div>
          <div>
            <h3 className="text-label-md font-bold text-primary">Market Insight</h3>
            <p className="text-body-md text-gray-100">{getMarketTip()}</p>
          </div>
        </div>
      </div>

      {/* View Forecast Button */}
      {!isLoading && (
        <button className="w-full btn-tertiary btn-spring" onClick={() => setShowForecast(true)}>
          View 7-Day Forecast
        </button>
      )}

      {/* 7-Day Forecast Modal */}
      {showForecast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-modal w-full max-w-md max-h-[85vh] overflow-y-auto p-6 relative animate-bounce-in">
            <button
              className="absolute top-4 right-4 text-outline hover:text-primary transition-colors"
              onClick={() => setShowForecast(false)}
            >
              ✕
            </button>
            <h2 className="text-headline-md text-primary mb-1">7-Day Forecast</h2>
            <p className="text-body-md text-gray-100 mb-4">Plan your farming activities for {crop}.</p>

            {forecastLoading ? (
              <div className="text-center py-6 text-gray-100 animate-pulse">Loading forecast...</div>
            ) : forecast.length === 0 ? (
              <div className="text-center py-6 text-gray-100">No forecast data available.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-variant/40 text-label-sm text-gray-100 uppercase">
                      <th className="py-2 px-3">Day</th>
                      <th className="py-2 px-3">Max°C</th>
                      <th className="py-2 px-3">Min°C</th>
                      <th className="py-2 px-3">Rain</th>
                      <th className="py-2 px-3">Wind</th>
                      <th className="py-2 px-3">Advice</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {forecast.map((day, idx) => (
                      <tr key={idx} className="border-t border-outline-variant/20 hover:bg-surface-variant/10 transition-colors">
                        <td className="py-2 px-3 font-bold text-primary">{day.day}</td>
                        <td className="py-2 px-3 text-error font-medium">{Math.round(day.maxTemp)}°</td>
                        <td className="py-2 px-3 text-primary font-medium">{Math.round(day.minTemp)}°</td>
                        <td className="py-2 px-3 text-gray-100">{Math.round(day.rain * 10) / 10}mm</td>
                        <td className="py-2 px-3 text-gray-100">{Math.round(day.wind)} km/h</td>
                        <td className="py-2 px-3 text-xs">{getDayAdvice(day.rain, day.maxTemp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="w-full btn-primary mt-6" onClick={() => setShowForecast(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
