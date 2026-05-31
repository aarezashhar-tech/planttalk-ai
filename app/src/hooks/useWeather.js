import { useState, useEffect } from 'react';

export const useWeather = (userId) => {
  const [data, setData] = useState({
    weather: { temperature: '--', humidity: '--', rainChance: '--', locationName: 'Loading...' },
    profile: null,
    insights: { summary: 'Loading...', action: 'Loading...', pestRisk: '--', health: '--' },
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchInsights = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/insights?user_id=${userId}`);

        if (!response.ok) {
          // Don't throw — just stop loading and keep last good data
          setData(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const result = await response.json();

        setData({
          weather: result.weather || { temperature: '--', humidity: '--', rainChance: '--', locationName: 'N/A' },
          profile: result.profile || null,
          insights: result.insights || { summary: 'No data', action: 'Try again later', pestRisk: '--', health: '--' },
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error("Backend fetch error:", err);
        // Keep previous data visible — only mark as not loading
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchInsights();
    const interval = setInterval(fetchInsights, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [userId]);

  return data;
};
