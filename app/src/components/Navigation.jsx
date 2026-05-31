import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { id: '/dashboard', icon: '🏠', label: 'Home' },
  { id: '/doctor', icon: '🌿', label: 'Doctor' },
  { id: '/india-forecast', icon: '🇮🇳', label: 'India' },
  { id: '/community', icon: '👨‍🌾', label: 'Community' },
  { id: '/settings', icon: '⚙️', label: 'Settings' }
];

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRoute = location.pathname;
  return (
    <>
      {/* DESKTOP SIDEBAR: Hidden on mobile, visible on desktop (md+) */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed left-6 top-6 bottom-6 w-20 hover:w-64 hidden md:flex flex-col bg-[#080C0A]/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden transition-all duration-500 z-50 group"
      >
        {/* Branding - Top */}
        <div className="p-6 pb-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0">
            🌱
          </div>
          <span className="text-white font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            PLANTTALK AI
          </span>
        </div>

        {/* Navigation Links - Bottom Aligned within Sidebar */}
        <div className="flex-1 py-8 px-4 flex flex-col justify-end gap-4">
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-white/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="desktopActiveIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                  />
                )}
                <span className={`text-xl shrink-0 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-90'} transition-transform duration-300`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-gray-100'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* User Profile - Fixed Bottom */}
        <div className="p-4 border-t border-white/5 mt-4">
          <div className="flex items-center gap-4 p-2 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-500 shrink-0 border border-white/20 flex items-center justify-center text-white font-bold">
              AA
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
              <p className="text-xs text-white font-bold">Aarez Ashhar</p>
              <p className="text-[10px] text-emerald-400">Machine Learning</p>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE BOTTOM NAV: Visible only on mobile (<md) */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed bottom-4 left-4 right-4 md:hidden flex items-center justify-between px-4 py-3 bg-[#080C0A]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_4px_40px_rgba(16,185,129,0.2)] z-50"
      >
        {navItems.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 cursor-pointer"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobileActiveIndicator"
                  className="absolute inset-0 bg-white/10 rounded-2xl shadow-[inset_0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30"
                />
              )}
              <span className={`text-xl z-10 transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-90'}`}>
                {item.icon}
              </span>
              {isActive && (
                <span className="text-[9px] font-bold text-emerald-400 absolute bottom-1 z-10 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </motion.nav>
    </>
  );
}
