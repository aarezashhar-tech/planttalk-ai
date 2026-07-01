import React, { useState, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { LocationSearch } from '../components/LocationSearch';
import { TopNavbar } from '../components/TopNavbar';

export const Settings = ({ userProfile, onProfileUpdate, onLocationSelected }) => {
  const { language, setLanguage, t } = useTranslation();
  const [lang, setLang] = useState(language);
  const [farmerName, setFarmerName] = useState(userProfile?.farmerName || '');
  const [crop, setCrop] = useState(userProfile?.crop || 'Wheat');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fileInputRef = useRef(null);
  const [avatarBase64, setAvatarBase64] = useState(userProfile?.avatar || null);

  const session = JSON.parse(localStorage.getItem('planttalk_session') || '{}');
  const isGoogle = session.auth_provider === 'gmail';
  const isGuest = session.user_id === 'guest_123';

  const displayName = isGoogle ? session.name : (isGuest ? 'Guest User' : (farmerName || ''));
  const displaySubtitle = isGoogle ? session.contact : (isGuest ? 'Guest User' : '');
  const displayAvatarUrl = avatarBase64 || (isGoogle ? session.picture : null);
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  const displayLocation = userProfile?.location
    ? `${userProfile.location}${userProfile.state ? ', ' + userProfile.state : ''}`
    : 'Unknown Location';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarBase64(base64String);
        
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = { ...currentProfile, ...userProfile, avatar: base64String };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        if (onProfileUpdate) onProfileUpdate(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLanguage(lang);
    setIsEditingProfile(false);
    const updatedProfile = { 
      ...userProfile, 
      language: lang,
      farmerName,
      crop
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
    } catch (e) {
      console.warn('Backend sync skipped:', e.message);
    }

    if (onProfileUpdate) onProfileUpdate(updatedProfile);
    alert(t('Settings Saved!'));
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('selectedLocation');
    localStorage.removeItem('planttalk_session');
    window.location.href = '/login';
  };

  return (
    <div className="font-body-md text-body-md antialiased selection:bg-secondary selection:text-black min-h-screen flex text-white bg-[#0F1C14]">
      {/* Animated Background Mesh */}
      <div className="fixed top-0 left-0 w-screen h-screen z-[-1] pointer-events-none" style={{
        background: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 40%),
                     radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`,
        animation: 'mesh-pulse 15s ease-in-out infinite alternate'
      }}></div>

      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full p-6 bg-surface-container dark:bg-surface-container fixed left-0 top-0 w-64 rounded-r-xl bg-gradient-to-b from-primary-container to-surface-container-lowest backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] z-40">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="material-icons text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-secondary tracking-tight text-xl leading-none">PLANTTALK AI</h1>
            <p className="font-label-mono text-label-mono text-gray-100 text-[10px] uppercase tracking-wider mt-1">Living Intelligence</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-2 flex flex-col">
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg group" href="/">
            <span className="material-icons group-hover:text-secondary transition-colors">home</span>
            <span className="font-label-mono text-sm">{t('Home')}</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg group" href="/doctor">
            <span className="material-icons group-hover:text-secondary transition-colors">medical_services</span>
            <span className="font-label-mono text-sm">{t('Doctor')}</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg group" href="/india">
            <span className="material-icons group-hover:text-secondary transition-colors">location_on</span>
            <span className="font-label-mono text-sm">{t('India')}</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg group" href="/community">
            <span className="material-icons group-hover:text-secondary transition-colors">groups</span>
            <span className="font-label-mono text-sm">{t('Community')}</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary bg-white/10 rounded-lg border-l-2 border-secondary hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 scale-95" href="/settings">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 1"}}>settings</span>
            <span className="font-label-mono text-sm font-bold">{t('Settings')}</span>
          </a>
        </div>
      </nav>

      {/* Mobile Header — Bug 4: removed bell icon */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a1a10]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50">
            <span className="material-icons text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          </div>
          <span className="font-bold text-secondary text-base tracking-tight">PlantTalk AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-gray-100 hover:text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full">
            <span className="material-icons text-xl">account_circle</span>
          </button>
        </div>
      </header>

      {/* Desktop TopAppBar */}
      <TopNavbar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 min-h-screen relative z-10">
        <div className="mb-8 animate-slide-up" style={{animationDelay: '0s', animationFillMode: 'both'}}>
          <h1 className="font-display-lg text-2xl md:text-[40px] font-bold text-white tracking-tight mb-1 md:mb-2">{t('Account Settings')}</h1>
          <p className="text-gray-100 font-body-md text-sm md:text-base">{t('Manage your profile, preferences, and system configurations.')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Profile Card */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            
            {/* User Profile Glass Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden animate-slide-up hover:bg-white/10 transition-colors" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full mb-4 md:mb-6 p-1 bg-gradient-to-br from-secondary/40 to-surface-container border border-white/10 shadow-[0_0_25px_rgba(16,185,129,0.15)] group cursor-pointer flex items-center justify-center overflow-hidden">
                {displayAvatarUrl ? (
                  <img src={displayAvatarUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl md:text-5xl font-bold">{initial}</span>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="material-icons text-white">photo_camera</span>
                </div>
              </div>
              
              <h2 className="font-headline-lg md:text-2xl text-xl font-bold text-white mb-1 truncate w-full text-center px-4">{displayName || t('Enter your name')}</h2>
              <p className="font-label-mono text-secondary mb-6 tracking-widest uppercase text-xs truncate w-full px-4">{displaySubtitle}</p>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group min-h-[44px]"
                >
                  <span className="material-icons text-sm group-hover:text-secondary transition-colors">edit</span>
                  {t('Edit Avatar')}
                </button>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`flex-1 py-2.5 px-4 border rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group min-h-[44px] ${isEditingProfile ? 'bg-secondary/20 border-secondary/50 text-secondary' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
                >
                  <span className="material-icons text-sm group-hover:text-secondary transition-colors">edit_note</span>
                  {t('Edit Profile')}
                </button>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-6 animate-slide-up hover:bg-white/10 transition-colors" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              <h3 className="font-headline-lg md:text-xl text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="material-icons text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>tune</span>
                {t('Preferences')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{t('Push Notifications')}</p>
                    <p className="text-xs text-gray-100 mt-1">{t('Alerts for crop anomalies')}</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-transparent right-0 z-10 transition-all peer" style={pushEnabled ? {borderColor: '#10B981', transform: 'translateX(0)'} : {borderColor: '#e2e8f0', transform: 'translateX(-1.5rem)'}} type="checkbox"/>
                    <label className="block overflow-hidden h-6 rounded-full cursor-pointer bg-white/20 transition-all peer-checked:bg-secondary"></label>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{t('Weekly Reports')}</p>
                    <p className="text-xs text-gray-100 mt-1">{t('Email digest of analytics')}</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-transparent right-0 z-10 transition-all peer" style={emailEnabled ? {borderColor: '#10B981', transform: 'translateX(0)'} : {borderColor: '#e2e8f0', transform: 'translateX(-1.5rem)'}} type="checkbox"/>
                    <label className="block overflow-hidden h-6 rounded-full cursor-pointer bg-white/20 transition-all peer-checked:bg-secondary"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Danger Zone */}
            <div className="bg-white/5 backdrop-blur-xl border border-error-container/30 rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
              <button onClick={handleLogout} className="w-full py-3 px-4 bg-error-container/10 hover:bg-error-container/20 border border-error-container/50 rounded-lg text-error hover:text-error-container transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px]">
                <span className="material-icons">logout</span>
                <span className="font-medium text-sm">{t('Logout Securely')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-8 animate-slide-up hover:bg-white/10 transition-colors" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <h3 className="font-headline-lg md:text-2xl text-xl font-bold text-white flex items-center gap-3">
                  <span className="material-icons text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>badge</span>
                  {t('Personal Information')}
                </h3>
                <div className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#10B981] animate-pulse"></span>
                  <span className="font-label-mono text-xs text-secondary uppercase">Synced</span>
                </div>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field — Bug 5: no more 'Farmer' default */}
                  <div className="space-y-2">
                    <label className="font-label-mono text-xs text-gray-100 uppercase tracking-wider block">{t('Full Name')}</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-100 group-focus-within:text-secondary transition-colors material-icons text-lg pl-3">person</span>
                      <input 
                        className={`w-full pl-10 pr-4 py-3 rounded-t-lg bg-black/20 text-white focus:bg-black/30 transition-all text-sm border-b border-white/20 focus:border-secondary outline-none focus:shadow-[0_1px_0_0_#10B981] ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                        type="text" 
                        value={farmerName}
                        onChange={e => setFarmerName(e.target.value)}
                        placeholder={t('Enter your name')}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                  
                  {/* Location Field */}
                  <div className="space-y-2">
                    <label className="font-label-mono text-xs text-gray-100 uppercase tracking-wider block">{t('Location / Zone')}</label>
                    <div className="relative group z-20">
                      <LocationSearch 
                        onLocationSelected={(loc) => { if(onLocationSelected) onLocationSelected(loc); }}
                        currentLocation={displayLocation}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  {/* Crop Type Field */}
                  <div className="space-y-2">
                    <label className="font-label-mono text-xs text-gray-100 uppercase tracking-wider block">{t('Primary Crop Focus')}</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-100 group-focus-within:text-secondary transition-colors material-icons text-lg pl-3">grass</span>
                      <select 
                        className={`w-full pl-10 pr-8 py-3 rounded-t-lg bg-black/20 text-white focus:bg-black/30 transition-all text-sm appearance-none cursor-pointer border-b border-white/20 focus:border-secondary outline-none focus:shadow-[0_1px_0_0_#10B981] ${!isEditingProfile ? 'opacity-60 pointer-events-none' : ''}`}
                        value={crop}
                        onChange={e => setCrop(e.target.value)}
                        disabled={!isEditingProfile}
                      >
                        <option value="Wheat">{t('Wheat')}</option>
                        <option value="Rice">{t('Rice')}</option>
                        <option value="Corn">{t('Corn')}</option>
                        <option value="Soybean">{t('Soybean')}</option>
                        <option value="Cotton">{t('Cotton')}</option>
                        <option value="Sugarcane">{t('Sugarcane')}</option>
                        <option value="Tomato">{t('Tomato')}</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-icons text-gray-100">arrow_drop_down</span>
                    </div>
                    <p className="text-[10px] text-gray-100/90 mt-1">{t('Calibrates AI models for specific phenological stages.')}</p>
                  </div>

                  {/* Language Field */}
                  <div className="space-y-2">
                    <label className="font-label-mono text-xs text-gray-100 uppercase tracking-wider block">{t('Interface Language')}</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-100 group-focus-within:text-secondary transition-colors material-icons text-lg pl-3">language</span>
                      <select 
                        className="w-full pl-10 pr-8 py-3 rounded-t-lg bg-black/20 text-white focus:bg-black/30 transition-all text-sm appearance-none cursor-pointer border-b border-white/20 focus:border-secondary outline-none focus:shadow-[0_1px_0_0_#10B981]"
                        value={lang}
                        onChange={e => setLang(e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-icons text-gray-100">arrow_drop_down</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-8 mt-4 flex justify-end gap-4 border-t border-white/10">
                  <button type="button" className="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium min-h-[44px]">
                    {t('Discard Changes')}
                  </button>
                  <button type="submit" className="bg-secondary text-black px-8 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 group hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-px transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] min-h-[44px]">
                    <span className="material-icons text-sm group-hover:rotate-12 transition-transform">save</span>
                    {t('Save Configuration')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mesh-pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.1); opacity: 1; }
        }
      `}} />
    </div>
  );
};
