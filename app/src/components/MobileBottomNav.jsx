import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/doctor', icon: 'medical_services', label: 'Doctor' },
  { path: '/india', icon: 'location_on', label: 'India' },
  { path: '/community', icon: 'groups', label: 'Community' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1a10]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex justify-around items-center px-2 py-1 safe-area-bottom">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/' && location.pathname === '/dashboard');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-secondary'
                  : 'text-gray-400 active:scale-90'
              }`}
            >
              <span
                className={`material-icons text-[22px] transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-secondary mt-0.5 shadow-[0_0_6px_#10B981]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
