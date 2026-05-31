import React from 'react';
import { useForecast } from '../hooks/useForecast';

export const Notifications = ({ backendData, userProfile, locationForecast }) => {
  const { weather, isLoading } = backendData || {};
  const { temperature, humidity, rainChance } = weather || {};
  const crop = userProfile?.crop || 'Crop';
  const userId = userProfile?.user_id;

  const { forecast: backendForecast, isLoading: forecastLoading } = useForecast(userId);
  const forecast = locationForecast && locationForecast.length > 0 ? locationForecast : backendForecast;

  const generateAlerts = () => {
    if (isLoading) return [];

    const alerts = [];

    // --- Current weather alerts ---
    let pestRisk = false;
    if (crop === 'Rice' && humidity > 85) pestRisk = true;
    if (crop === 'Tomato' && humidity > 85) pestRisk = true;
    if (crop === 'Wheat' && humidity > 80) pestRisk = true;
    if (crop === 'Cotton' && temperature >= 25 && temperature <= 35) pestRisk = true;

    if (pestRisk) {
      alerts.push({
        id: 'pest',
        type: 'URGENT',
        color: 'border-l-error text-error',
        message: `Pest risk HIGH for your ${crop} - Act today`,
        action: 'View Pest Guide'
      });
    }

    if (temperature > 38) {
      alerts.push({
        id: 'heat',
        type: 'WARNING',
        color: 'border-l-tertiary-container text-tertiary-container',
        message: `Temperature ${temperature}°C - Risk of heat stress`,
        action: 'Irrigate Now'
      });
    }

    if (rainChance < 20) {
      alerts.push({
        id: 'water',
        type: 'WARNING',
        color: 'border-l-tertiary-container text-tertiary-container',
        message: `Water your ${crop} today - low rain probability`,
        action: 'See Forecast'
      });
    }

    alerts.push({
      id: 'fert',
      type: 'REMINDER',
      color: 'border-l-secondary text-secondary',
      message: `Fertilizer due in 3 days for ${crop} (${userProfile?.growthStage} stage)`,
      action: 'Dismiss'
    });

    // --- Forecast-based alerts ---
    if (!forecastLoading && forecast.length > 0) {
      // Rain > 3mm on any day
      forecast.forEach((day) => {
        if (day.rain > 3) {
          alerts.push({
            id: `rain-${day.day}`,
            type: 'WARNING',
            color: 'border-l-tertiary-container text-tertiary-container',
            message: `🟡 Rain coming ${day.day} (${Math.round(day.rain * 10) / 10}mm) - Plan irrigation accordingly`,
            action: 'View Forecast'
          });
        }
      });

      // Heat stress: maxTemp > 35 on any day
      forecast.forEach((day) => {
        if (day.maxTemp > 35) {
          alerts.push({
            id: `heatday-${day.day}`,
            type: 'URGENT',
            color: 'border-l-error text-error',
            message: `🔴 Heat stress alert on ${day.day} (${Math.round(day.maxTemp)}°C) - Water crops early morning`,
            action: 'Plan Irrigation'
          });
        }
      });

      // 3+ consecutive days of rain → fungal risk
      let consecutiveRain = 0;
      let maxConsecutive = 0;
      forecast.forEach((day) => {
        if (day.rain > 0) {
          consecutiveRain++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveRain);
        } else {
          consecutiveRain = 0;
        }
      });
      if (maxConsecutive >= 3) {
        alerts.push({
          id: 'fungal',
          type: 'URGENT',
          color: 'border-l-error text-error',
          message: `🔴 Fungal risk this week (${maxConsecutive} days of rain) - Prepare neem spray`,
          action: 'View Guide'
        });
      }
    }

    if (alerts.length === 1) {
      alerts.push({
        id: 'info',
        type: 'INFO',
        color: 'border-l-primary text-primary',
        message: `Good conditions today - No critical action needed`,
        action: 'Dismiss'
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 animate-fade-in">
      <header className="mb-6 animate-slide-down">
        <h1 className="text-headline-lg-mobile text-primary">Alerts</h1>
        <p className="text-body-md text-gray-100">Real-time notifications for your farm</p>
      </header>

      <div className="space-y-4">
        {isLoading || forecastLoading ? (
          <div className="glass-card p-6 flex justify-center text-gray-100">
            <div className="skeleton-shimmer h-6 w-1/2"></div>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`glass-card p-4 border-l-4 ${alert.color.split(' ')[0]} animate-slide-up stagger-${Math.min(alerts.indexOf(alert) + 1, 8)} card-hover`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-label-md font-bold ${alert.color.split(' ')[1]}`}>
                  {alert.type === 'URGENT' ? '🔴' : alert.type === 'WARNING' ? '🟡' : alert.type === 'REMINDER' ? '🔵' : '🟢'} {alert.type}
                </h3>
                <span className="text-label-sm text-gray-100">Just now</span>
              </div>
              <p className="text-body-md text-white mb-4">{alert.message}</p>
              <div className="flex justify-end">
                <button className="text-label-md font-bold text-primary bg-secondary-container/30 px-4 py-2 rounded-lg transition-colors active:bg-secondary-container btn-spring">
                  {alert.action}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
