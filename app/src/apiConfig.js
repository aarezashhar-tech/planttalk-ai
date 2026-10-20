// Centralized API configuration for PlantTalk AI
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://planttalk-ai.onrender.com').replace(/\/+$/, '');

export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};
