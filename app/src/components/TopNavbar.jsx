import React, { useState } from 'react';

export const TopNavbar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const session = JSON.parse(localStorage.getItem('planttalk_session') || '{}');
  const isGoogle = session.auth_provider === 'gmail';
  const isGuest = session.user_id === 'guest_123';

  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const farmerName = userProfile?.farmerName || 'Farmer';

  const displayName = isGoogle ? session.name : (isGuest ? 'Guest User' : farmerName);
  const displaySubtitle = isGoogle ? session.contact : (isGuest ? 'Guest User' : 'Lead Agronomist');
  const displayAvatarUrl = isGoogle ? session.picture : null;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('selectedLocation');
    localStorage.removeItem('planttalk_session');
    window.location.href = '/login';
  };

  return (
    <header className="hidden md:flex justify-between items-center px-8 bg-transparent font-headline-lg font-body-md fixed top-0 right-0 w-[calc(100%-16rem)] h-20 backdrop-blur-md border-b border-white/5 z-30">
      <div className="flex items-center">
        <h2 className="font-headline-lg font-black text-secondary text-2xl font-bold tracking-tight hidden">PlantTalk AI</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-gray-100 text-sm group-focus-within:text-secondary transition-colors">search</span>
          </div>
          <input className="bg-black/20 border-b border-white/20 focus:border-secondary outline-none pl-10 pr-4 py-2 rounded-full w-64 text-sm focus:w-72 transition-all duration-300 placeholder:text-gray-100/90 focus:shadow-[0_1px_0_0_#10B981] focus:bg-black/30 text-white" placeholder="Search..." type="text"/>
        </div>
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <button onClick={() => alert('No new notifications')} className="text-gray-100 hover:text-secondary transition-colors hover:-translate-y-px transition-transform relative">
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full shadow-[0_0_5px_#10B981]"></span>
          </button>
          <div className="relative">
            <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:border-secondary transition-all overflow-hidden relative group">
              {displayAvatarUrl ? (
                <img src={displayAvatarUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <span className="text-white font-bold">{initial}</span>
              )}
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#09160e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/5 bg-black/20">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-100 truncate">{displaySubtitle}</p>
                </div>
                <button onClick={() => { setShowAccountMenu(false); window.location.href = '/settings'; }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5">
                  View Profile
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-error hover:bg-[#93000a]/20 transition-colors">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
