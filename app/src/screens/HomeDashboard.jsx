import React, { useState, useEffect } from 'react';
import { LocationSearch } from '../components/LocationSearch';
import { useLocationWeather } from '../hooks/useLocationWeather';
import { useTranslation } from '../contexts/LanguageContext';

export default function HomeDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState({ weather: null, insights: null, profile: null });
  const [loading, setLoading] = useState(true);
  const { fetchWeatherForLocation, isLoading: searchLoading } = useLocationWeather();

  const [soilData, setSoilData] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('planttalk_session') || '{}');
    const userId = session.user_id || 1;
    const storedLocation = JSON.parse(localStorage.getItem('selectedLocation'));

    fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/insights?user_id=${userId}`)
      .then(res => res.json())
      .then(async resData => {
        if (storedLocation) {
          try {
            const locRes = await fetchWeatherForLocation(
              storedLocation.latitude, 
              storedLocation.longitude, 
              `${storedLocation.locationName}, ${storedLocation.state}`
            );
            if (locRes) {
              resData.weather = locRes.weather;
              resData.insights = locRes.insights;
            }
          } catch (e) {
            console.error("Location override failed on load:", e);
          }
        }
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, [fetchWeatherForLocation]);

  const lat = data.profile?.latitude || 28.6139;
  const lon = data.profile?.longitude || 77.2090;

  useEffect(() => {
    if (lat && lon) {
      console.log(`[Soil API] Fetching soil data for lat=${lat}, lon=${lon}`);
      setSoilLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/soil?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          console.log('[Soil API] Response:', data);
          setSoilData(data);
          setSoilLoading(false);
        })
        .catch(err => {
          console.error("[Soil API] Failed to fetch soil data:", err);
          setSoilLoading(false);
        });
    }
  }, [lat, lon]);

  const handleLocationSelected = async (locationData) => {
    try {
      const result = await fetchWeatherForLocation(
        locationData.latitude,
        locationData.longitude,
        `${locationData.locationName}, ${locationData.state}`
      );
      if (result) {
        setData(prev => ({
          ...prev,
          weather: result.weather,
          insights: result.insights,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch location weather:", e);
    }
  };

  const getSoilStatus = (val, type) => {
    if (!val) return 'Loading...';
    if (type === 'ph') {
      if (val < 5.5) return 'Low';
      if (val > 7.5) return 'High';
      return 'Optimal';
    }
    if (val < 20) return 'Low';
    if (val > 80) return 'High';
    return 'Good';
  };

  const getSoilColor = (val, type) => {
    if (!val) return 'text-gray-100';
    if (type === 'ph') {
      if (val < 5.5 || val > 7.5) return 'text-error';
      return 'text-secondary';
    }
    if (val < 20) return 'text-error';
    if (val > 80) return 'text-tertiary';
    return 'text-secondary';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0F1C14]">
      <div className="text-secondary font-medium animate-pulse">Initializing Verdant Intelligence...</div>
    </div>
  );

  const { weather, insights, profile } = data;
  const isFetchingLocation = searchLoading;

  return (
    <div className="text-white font-body-md text-body-md antialiased selection:bg-secondary selection:text-on-secondary min-h-screen bg-[#0F1C14]">
      {/* Animated Mesh Background */}
      <div className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none" style={{
        background: `radial-gradient(circle at 15% 50%, rgba(26, 71, 49, 0.4), transparent 50%),
                     radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.15), transparent 50%),
                     radial-gradient(circle at 50% 80%, rgba(59, 103, 79, 0.3), transparent 50%)`,
        backgroundSize: '200% 200%',
        animation: 'meshAnimation 20s ease infinite'
      }}></div>
      
      <div className="flex h-screen overflow-hidden">
        {/* SideNavBar */}
        <nav className="hidden md:flex flex-col h-full p-6 bg-surface-container dark:bg-surface-container fixed left-0 top-0 w-64 rounded-r-xl bg-gradient-to-b from-primary-container to-surface-container-lowest backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] z-50">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg font-bold text-secondary tracking-tight">PLANTTALK AI</h1>
            <p className="font-label-mono text-label-mono text-gray-100 mt-1">Living Intelligence</p>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 text-secondary bg-white/10 rounded-lg border-l-2 border-secondary scale-95 transition-transform duration-200" style={{boxShadow: '0 0 10px #10B981'}} href="/">
              <span className="material-icons" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
              <span className="font-label-mono text-label-mono">Home</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/doctor">
              <span className="material-icons">medical_services</span>
              <span className="font-label-mono text-label-mono">Doctor</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/india">
              <span className="material-icons">location_on</span>
              <span className="font-label-mono text-label-mono">India</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/community">
              <span className="material-icons">groups</span>
              <span className="font-label-mono text-label-mono">Community</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/settings">
              <span className="material-icons">settings</span>
              <span className="font-label-mono text-label-mono">Settings</span>
            </a>
          </div>
          
        </nav>

        {/* Main Content Canvas */}
        <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto relative z-10">
          {/* TopAppBar */}
          <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-20 bg-transparent backdrop-blur-md border-b border-white/5 flex justify-between items-center px-8 z-40">
            <div className="md:hidden">
              <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-secondary">PlantTalk AI</span>
            </div>
            <div className="hidden md:block flex-1"></div>
            <div className="flex items-center gap-4">
              <button className="text-gray-100 hover:text-secondary hover:-translate-y-[1px] transition-all p-2 rounded-full hover:bg-white/5">
                <span className="material-icons">notifications</span>
              </button>
              <button className="text-gray-100 hover:text-secondary hover:-translate-y-[1px] transition-all p-2 rounded-full hover:bg-white/5">
                <span className="material-icons">account_circle</span>
              </button>
            </div>
          </header>

          {/* Dashboard Content Container */}
          <div className="pt-28 pb-12 px-5 md:px-8 max-w-[1600px] mx-auto min-h-screen flex flex-col gap-8">
            {/* Hero Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
              <div>
                <h2 className="font-display-lg text-4xl font-bold text-white tracking-tight">Welcome back, {profile?.farmerName || 'Farmer'}! 🌾</h2>
                <p className="font-body-md text-body-md text-gray-100 mt-2 max-w-2xl">Here is your active field intelligence for today.</p>
              </div>
            </section>

            {/* Location Search & Chips */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-6 shadow-lg animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative w-full max-w-md">
                   <LocationSearch 
                    onLocationSelected={handleLocationSelected} 
                    currentLocation={weather?.locationName} 
                  />
                </div>
                {isFetchingLocation && (
                  <div className="px-4 py-2 rounded-full bg-secondary/20 border border-secondary/50 text-secondary text-sm animate-pulse">
                    🔄 Syncing atmospheric data...
                  </div>
                )}
              </div>
            </section>

            {/* 4 Column Bento Grid */}
            <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetchingLocation ? 'opacity-90 pointer-events-none' : 'opacity-100'}`}>
              
              {/* Card 1: Live Weather */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-lg animate-slide-up cursor-pointer group" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
                <div className="flex justify-between items-start">
                  <span className="font-label-mono text-label-mono text-gray-100 uppercase tracking-wider text-xs font-semibold">{t('Live Weather')}</span>
                  <span className="material-icons text-tertiary text-3xl font-bold group-hover:scale-110 transition-transform">light_mode</span>
                </div>
                <div>
                  <div className="font-display-lg text-5xl font-bold text-white mt-2 mb-1 flex items-baseline gap-1">
                    <span>{weather?.temperature || '--'}</span>°C
                  </div>
                  <p className="font-body-md text-body-md text-gray-100">{weather?.locationName || 'Unknown Location'}</p>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-primary text-sm">water_drop</span>
                    <span className="font-label-mono text-label-mono text-gray-100 text-sm">{weather?.humidity || '--'}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-primary text-sm">rainy</span>
                    <span className="font-label-mono text-label-mono text-gray-100 text-sm">{weather?.rainChance || '--'}%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Pest Risk */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-lg animate-slide-up cursor-pointer group" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
                <div className="flex justify-between items-start">
                  <span className="font-label-mono text-label-mono text-gray-100 uppercase tracking-wider text-xs font-semibold">{t('Pest Risk')}</span>
                  <span className={`material-icons ${insights?.pestRisk?.includes('CRITICAL') ? 'text-error' : 'text-secondary'}`}>bug_report</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className={`w-4 h-4 rounded-full ${insights?.pestRisk?.includes('CRITICAL') || insights?.pestRisk?.includes('HIGH') ? 'bg-error animate-[pulse-critical_2s_infinite]' : 'bg-secondary animate-[pulse-good_2s_infinite]'}`} style={insights?.pestRisk?.includes('CRITICAL') || insights?.pestRisk?.includes('HIGH') ? {boxShadow: '0 0 10px rgba(255,82,82,0.5)'} : {boxShadow: '0 0 10px rgba(16,185,129,0.5)'}}></div>
                  <span className={`font-headline-lg text-2xl font-bold tracking-tight ${insights?.pestRisk?.includes('CRITICAL') || insights?.pestRisk?.includes('HIGH') ? 'text-error' : 'text-secondary'}`}>
                    {insights?.pestRisk ? t(insights.pestRisk.split(' ')[0]) : t('LOW')}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-gray-100 mt-4 text-sm leading-relaxed">
                  {insights?.action || insights?.recommendedAction ? t(insights.action || insights.recommendedAction) : t('No immediate action required.')}
                </p>
              </div>

              {/* Card 3: Overall Health */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-lg animate-slide-up cursor-pointer group" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
                <div className="flex justify-between items-start">
                  <span className="font-label-mono text-label-mono text-gray-100 uppercase tracking-wider text-xs font-semibold">{t('Overall Health')}</span>
                  <span className="material-icons text-secondary">eco</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-4 h-4 rounded-full bg-secondary animate-[pulse-good_2s_infinite]" style={{boxShadow: '0 0 10px rgba(16,185,129,0.5)'}}></div>
                  <span className="font-headline-lg text-2xl font-bold tracking-tight text-secondary">
                    {insights?.health ? t(insights.health.split(' ')[0]) : t('GOOD')}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-label-mono text-label-mono text-gray-100 text-xs">Crop</span>
                    <span className="font-label-mono text-label-mono text-white font-semibold text-sm">{profile?.crop || 'Crop'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-label-mono text-label-mono text-gray-100 text-xs">Next Watering</span>
                    <span className="font-label-mono text-label-mono text-white text-sm">Today <span className="text-primary">(5000L)</span></span>
                  </div>
                </div>
              </div>

              {/* Card 4: Soil Health */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-secondary/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-lg animate-slide-up cursor-pointer group" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-label-mono text-label-mono text-gray-100 uppercase tracking-wider text-xs font-semibold">Soil Health</span>
                  <span className="material-icons text-primary group-hover:rotate-12 transition-transform">science</span>
                </div>
                
                {soilLoading ? (
                   <div className="flex-1 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* pH */}
                    <div className="bg-black/20 rounded-lg p-3 border-l-2 border-secondary flex flex-col justify-center transition-colors hover:bg-black/30">
                      <span className="font-label-mono text-label-mono text-gray-100 text-[10px] uppercase">pH Level</span>
                      <span className={`font-headline-lg-mobile text-xl font-bold mt-1 ${getSoilColor(soilData?.ph, 'ph')}`}>
                        {soilData?.ph ? soilData.ph.toFixed(1) : '--'}
                      </span>
                    </div>
                    {/* Nitrogen */}
                    <div className="bg-black/20 rounded-lg p-3 border-l-2 border-tertiary flex flex-col justify-center transition-colors hover:bg-black/30">
                      <span className="font-label-mono text-label-mono text-gray-100 text-[10px] uppercase">Nitrogen (N)</span>
                      <span className={`font-body-md text-body-md font-semibold mt-1 text-sm ${getSoilColor(soilData?.n, 'npk')}`}>
                        {getSoilStatus(soilData?.n, 'npk')}
                      </span>
                    </div>
                    {/* Phosphorus */}
                    <div className="bg-black/20 rounded-lg p-3 border-l-2 border-secondary flex flex-col justify-center transition-colors hover:bg-black/30">
                      <span className="font-label-mono text-label-mono text-gray-100 text-[10px] uppercase">Phosphorus (P)</span>
                      <span className={`font-body-md text-body-md font-semibold mt-1 text-sm ${getSoilColor(soilData?.p, 'npk')}`}>
                        {getSoilStatus(soilData?.p, 'npk')}
                      </span>
                    </div>
                    {/* Potassium */}
                    <div className="bg-black/20 rounded-lg p-3 border-l-2 border-error flex flex-col justify-center transition-colors hover:bg-black/30">
                      <span className="font-label-mono text-label-mono text-gray-100 text-[10px] uppercase">Potassium (K)</span>
                      <span className={`font-body-md text-body-md font-semibold mt-1 text-sm ${getSoilColor(soilData?.k, 'npk')}`}>
                        {getSoilStatus(soilData?.k, 'npk')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-critical {
            0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
        }
        @keyframes pulse-good {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes meshAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}} />
    </div>
  );
}
