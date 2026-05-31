import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export default function IndiaForecast() {
  const { t } = useTranslation();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/india-forecast`)
      .then(res => res.json())
      .then(data => {
        setForecastData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch regional forecast", err);
        setLoading(false);
      });
  }, []);

  const toggleAccordion = (regionName) => {
    setExpandedRegion(prev => prev === regionName ? null : regionName);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0F1C14]">
      <div className="text-secondary font-medium animate-pulse">Loading IMD Ensemble Data...</div>
    </div>
  );
  
  if (!forecastData || forecastData.error) return (
    <div className="flex items-center justify-center h-screen bg-[#0F1C14]">
      <div className="text-error font-medium">Failed to sync regional data.</div>
    </div>
  );

  return (
    <div className="text-on-background min-h-screen overflow-x-hidden font-body-md flex bg-[#0F1C14]">
      {/* Background Gradient Animation */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-90">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest via-surface-container to-primary-container animate-[pulse-bg_10s_ease-in-out_infinite_alternate]"></div>
      </div>

      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full p-6 bg-surface-container dark:bg-surface-container fixed left-0 top-0 w-64 rounded-r-xl bg-gradient-to-b from-primary-container to-surface-container-lowest backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] z-50">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg font-bold text-secondary tracking-tight">PLANTTALK AI</h1>
          <p className="font-label-mono text-label-mono text-gray-100 mt-1">Living Intelligence</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>home</span>
            <span className="font-label-mono text-label-mono">Home</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/doctor">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>medical_services</span>
            <span className="font-label-mono text-label-mono">Doctor</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary bg-white/10 rounded-lg border-l-2 border-secondary scale-95 transition-transform duration-200" style={{boxShadow: '0 0 10px #10B981'}} href="/india">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 1"}}>location_on</span>
            <span className="font-label-mono text-label-mono">India</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/community">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>groups</span>
            <span className="font-label-mono text-label-mono">Community</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/settings">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>settings</span>
            <span className="font-label-mono text-label-mono">Settings</span>
          </a>
        </div>
        
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* TopAppBar */}
        <header className="hidden md:flex justify-between items-center px-8 bg-transparent fixed top-0 right-0 w-[calc(100%-16rem)] h-20 backdrop-blur-md border-b border-white/5 z-40">
          <div className="font-headline-lg text-headline-lg font-black text-secondary">PlantTalk AI</div>
          <div className="flex items-center gap-6">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center px-4 py-2 focus-within:border-secondary transition-colors">
              <span className="material-icons text-gray-100 mr-2">search</span>
              <input className="bg-transparent border-none text-white font-body-md text-body-md focus:ring-0 placeholder-on-surface-variant w-48 outline-none" placeholder="Search regions..." type="text"/>
            </div>
            <button className="text-gray-100 hover:text-secondary transition-colors hover:translate-y-[-1px] transition-transform">
              <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>notifications</span>
            </button>
            <button className="text-gray-100 hover:text-secondary transition-colors hover:translate-y-[-1px] transition-transform">
              <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>account_circle</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 p-5 md:p-8 pt-24 md:pt-28">
          {/* Banner */}
          <div className="w-full rounded-xl overflow-hidden relative h-64 mb-10 border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-surface-container-high to-surface-container opacity-90 z-10"></div>
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12">
              <h2 className="font-display-lg text-4xl font-bold text-white mb-2 tracking-tight">🇮🇳 {t('India Intelligence')}</h2>
              <p className="font-body-md text-body-md text-primary opacity-90 uppercase tracking-widest">{t('Multi-Model Regional Aggregate')}</p>
            </div>
          </div>

          {/* Accordion List */}
          <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            {forecastData.regions.map((region, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-xl overflow-hidden cursor-pointer group transition-colors" onClick={() => toggleAccordion(region.name)}>
                <div className="p-6 flex justify-between items-center border-b border-transparent group-hover:border-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/10 group-hover:border-secondary transition-colors">
                      <span className="material-icons text-secondary">explore</span>
                    </div>
                    <div>
                      <h3 className="font-headline-lg-mobile text-xl font-bold text-white">{region.name}</h3>
                      <p className="font-label-mono text-label-mono text-gray-100 mt-1">Avg Temp: {region.summary.avgTemp}°C</p>
                    </div>
                  </div>
                  <span className={`material-icons text-gray-100 transform transition-transform duration-300 ${expandedRegion === region.name ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
                
                <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${expandedRegion === region.name ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden bg-black/20">
                    <div className="p-6 border-t border-white/5 space-y-4">
                      {region.stations.map((station, sIdx) => (
                        <div key={sIdx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex justify-between font-semibold text-secondary">
                            <span>{station.city}, {station.state}</span>
                            <span>{station.current.temp}°C</span>
                          </div>
                          
                          {station.alerts.length > 0 && (
                            <div className="mt-3 text-xs bg-error/20 text-error p-3 rounded-lg border border-error/50">
                              ⚠️ {station.alerts[0].message}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-100 mt-3 font-medium flex gap-2">
                            <span className="text-primary">🌱</span> {station.agri_advisory}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-bg {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }
      `}} />
    </div>
  );
}
