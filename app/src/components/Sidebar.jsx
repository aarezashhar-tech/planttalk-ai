import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

const navItems = [
  { id: '/', icon: '🏠', label: 'Home' },
  { id: '/doctor', icon: '🌿', label: 'Doctor' },
  { id: '/india', icon: '🇮🇳', label: 'India' },
  { id: '/community', icon: '👨‍🌾', label: 'Community' },
  { id: '/settings', icon: '⚙️', label: 'Settings' }
];

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="w-[250px] bg-white border-r border-slate-200 fixed h-full flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600">🌱</div>
          <span className="font-bold text-slate-800 tracking-wide">PLANTTALK AI</span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.id || (item.id === '/' && location.pathname.includes('/dashboard'));
            return (
              <Link key={item.id} to={item.id} className={`flex items-center gap-3 p-3 rounded-md transition-colors ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-100 hover:bg-slate-50'}`}>
                <span className="text-xl">{item.icon}</span>
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-gray-100">AA</div>
        <div>
          <p className="text-sm font-bold text-slate-800">Aarez Ashhar</p>
          <p className="text-xs text-green-600">Machine Learning</p>
        </div>
      </div>
    </nav>
  );
}
