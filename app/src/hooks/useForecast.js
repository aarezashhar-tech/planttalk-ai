import { useState, useEffect } from 'react';

export const useForecast = (userId) => {
  const [forecast, setForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      setIsLoading(false);
      return;
    }

    const fetchForecast = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `https://planttalk-ai.onrender.com/api/forecast?user_id=${userId}`
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setForecast(data.forecast || []);
      } catch (err) {
        console.error('useForecast error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
    const interval = setInterval(fetchForecast, 900000); // 15 minutes
    return () => clearInterval(interval);
  }, [userId]);

  return { forecast, isLoading, error };
};

/** Returns per-day advice based on rain and maxTemp */
export const getDayAdvice = (rain, maxTemp) => {
  if (maxTemp > 35) return '🌡️ Heat stress risk';
  if (rain === 0) return '✅ Good day to spray pesticide';
  if (rain < 2) return '⚠️ Light rain - check before watering';
  return '🌧️ Skip irrigation - rain expected';
};
