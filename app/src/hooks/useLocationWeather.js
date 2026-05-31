import { useState, useCallback } from 'react';

/**
 * useLocationWeather
 * 
 * Fetches weather directly from Open-Meteo for a given lat/lon.
 * This is used when user picks a location from the LocationSearch component
 * to get real weather without requiring the Python backend.
 */
export const useLocationWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherForLocation = useCallback(async (lat, lon, locationName) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weathercode,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode&hourly=relativehumidity_2m,precipitation_probability,soil_temperature_0cm&timezone=Asia/Kolkata`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();

      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      // Current weather
      const weatherData = {
        temperature: Math.round(current.temperature_2m ?? 0),
        humidity: Math.round(current.relative_humidity_2m ?? 0),
        apparentTemperature: Math.round(current.apparent_temperature ?? 0),
        precipitation: current.precipitation ?? 0,
        rain: current.rain ?? 0,
        weatherCode: current.weathercode ?? 0,
        windSpeed: Math.round(current.windspeed_10m ?? 0),
        uvIndex: current.uv_index ?? 0,
        rainChance: daily.precipitation_probability_max?.[0] ?? 0,
        locationName: locationName,
        latitude: lat,
        longitude: lon,
      };

      // 7-day forecast
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const forecastData = (daily.time || []).map((dateStr, i) => {
        const d = new Date(dateStr);
        return {
          day: days[d.getDay()],
          date: dateStr,
          maxTemp: daily.temperature_2m_max?.[i] ?? 0,
          minTemp: daily.temperature_2m_min?.[i] ?? 0,
          rain: daily.precipitation_sum?.[i] ?? 0,
          rainChance: daily.precipitation_probability_max?.[i] ?? 0,
          wind: daily.windspeed_10m_max?.[i] ?? 0,
          weatherCode: daily.weathercode?.[i] ?? 0,
        };
      });

      // Soil temperature from hourly (average of today)
      const soilTemps = (hourly.soil_temperature_0cm || []).slice(0, 24);
      const avgSoilTemp = soilTemps.length > 0
        ? Math.round(soilTemps.reduce((a, b) => a + b, 0) / soilTemps.length)
        : null;

      weatherData.soilTemperature = avgSoilTemp;

      // Hourly humidity for today
      const hourlyHumidity = (hourly.relativehumidity_2m || []).slice(0, 24);
      weatherData.avgHumidityToday = hourlyHumidity.length > 0
        ? Math.round(hourlyHumidity.reduce((a, b) => a + b, 0) / hourlyHumidity.length)
        : weatherData.humidity;

      setWeather(weatherData);
      setForecast(forecastData);
      setIsLoading(false);

      // Generate insights based on weather
      const insights = generateInsights(weatherData, forecastData);

      return { weather: weatherData, forecast: forecastData, insights };
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  return { weather, forecast, isLoading, error, fetchWeatherForLocation };
};

/**
 * Generate AI-style insights from raw weather data
 */
function generateInsights(weather, forecast) {
  const { temperature, humidity, rainChance, windSpeed, uvIndex, soilTemperature } = weather;

  // Pest risk calculation
  let pestRisk = 'LOW 🟢';
  let pestAction = 'No immediate pest threat. Continue monitoring.';
  if (humidity > 85 && temperature > 25) {
    pestRisk = 'CRITICAL 🔴';
    pestAction = 'High humidity + warm temp = fungal/pest risk. Apply neem oil spray immediately.';
  } else if (humidity > 75 && temperature > 20) {
    pestRisk = 'HIGH 🟠';
    pestAction = 'Moderate pest conditions. Inspect crops and prepare spray if needed.';
  } else if (humidity > 60) {
    pestRisk = 'MODERATE 🟡';
    pestAction = 'Watch for early signs of pests. Keep fields clean.';
  }

  // Health assessment
  let health = 'GOOD 🟢';
  if (temperature > 40 || temperature < 5) {
    health = 'STRESSED 🔴';
  } else if (temperature > 35 || humidity < 30 || windSpeed > 40) {
    health = 'FAIR 🟡';
  }

  // Summary
  let summary = `Current: ${temperature}°C, ${humidity}% humidity, wind ${windSpeed} km/h.`;
  if (rainChance > 60) {
    summary += ' Rain likely today — skip irrigation.';
  } else if (temperature > 35) {
    summary += ' Heat stress risk — water early morning.';
  } else {
    summary += ' Conditions are favorable for farming activities.';
  }

  // Action recommendation
  let action = 'Monitor field conditions regularly.';
  if (rainChance > 70) {
    action = 'Rain incoming. Skip watering and avoid pesticide application.';
  } else if (temperature > 38) {
    action = 'Extreme heat. Irrigate immediately at dawn. Use mulching to retain moisture.';
  } else if (humidity > 85) {
    action = 'High humidity. Watch for fungal diseases. Apply preventive fungicide.';
  } else if (uvIndex > 8) {
    action = 'High UV. Protect sensitive crops with shade nets if possible.';
  }

  return {
    pestRisk,
    action: pestAction,
    health,
    summary,
    recommendedAction: action,
  };
}
