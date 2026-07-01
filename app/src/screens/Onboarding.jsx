import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const ALL_STATES_UTS = [
  // 28 States
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const Onboarding = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [stateQuery, setStateQuery] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [profile, setProfile] = useState({
    farmerName: '',
    location: '',
    state: '',
    farmSize: '',
    crop: 'Rice',
    growthStage: 'Vegetative',
    yieldTarget: '',
    sowDate: new Date().toISOString().split('T')[0]
  });

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const sessionStr = localStorage.getItem('userProfile');
      let userId = null;
      if (sessionStr) {
        userId = JSON.parse(sessionStr).user_id;
      }
      
      const finalProfile = { ...profile, user_id: userId, language: localStorage.getItem('preferredLang') || 'English' };
      
      // Save locally FIRST so the app can proceed even without backend
      const updatedSession = { ...JSON.parse(sessionStr || '{}'), ...finalProfile };
      localStorage.setItem('userProfile', JSON.stringify(updatedSession));

      // Try to sync with backend (non-blocking)
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}https://planttalk-ai.onrender.com/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalProfile)
        });
      } catch (e) {
        console.warn('Backend sync skipped (server not running):', e.message);
      }
      
      // Always proceed to dashboard
      onComplete();
    }
  };

  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Onion', 'Potato', 'Sugarcane', 'Groundnut', 'Soybean', 'Chilli', 'Brinjal', 'Cabbage', 'Cauliflower', 'Mango', 'Banana', 'Grapes', 'Pomegranate', 'Coconut'];
  const stages = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];

  // Filter states based on user typing
  const filteredStates = stateQuery.trim()
    ? ALL_STATES_UTS.filter(s => s.toLowerCase().includes(stateQuery.toLowerCase()))
    : ALL_STATES_UTS;

  const handleStateSelect = (state) => {
    setProfile({ ...profile, state });
    setStateQuery(state);
    setShowStateDropdown(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-24 text-on-background font-body">
      {step === 1 && (
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary text-on-primary rounded-[2rem] mx-auto flex items-center justify-center text-5xl font-bold shadow-card">
            🌱
          </div>
          <div>
            <h1 className="text-display-lg text-primary mb-2">PlantTalk AI</h1>
            <p className="text-headline-md text-gray-100 font-normal">{t('Smart Farming, Simple Guidance')}</p>
          </div>
          <button onClick={handleNext} className="btn-primary w-full max-w-[240px] text-lg py-4">
            {t('Get Started')}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-right duration-300">
          <h2 className="text-headline-lg-mobile text-primary mb-6">{t('Tell us about yourself')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Farmer Name')}</label>
              <input 
                type="text" 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={profile.farmerName}
                onChange={e => setProfile({...profile, farmerName: e.target.value})}
                placeholder={t('Enter your name')}
              />
            </div>
            
            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Location / Village')}</label>
              <input 
                type="text" 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                value={profile.location}
                onChange={e => setProfile({...profile, location: e.target.value})}
                placeholder={t('E.g., Coimbatore')}
              />
            </div>

            <div className="relative">
              <label className="block text-label-md text-gray-100 mb-1">{t('State')}</label>
              <input 
                type="text"
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary appearance-none"
                value={stateQuery || profile.state}
                onChange={e => {
                  setStateQuery(e.target.value);
                  setProfile({...profile, state: e.target.value});
                  setShowStateDropdown(true);
                }}
                onFocus={() => setShowStateDropdown(true)}
                placeholder={t('Type to search state/UT...')}
                autoComplete="off"
              />
              {showStateDropdown && filteredStates.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface border border-outline-variant/40 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredStates.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStateSelect(s)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/20 transition-colors border-b border-outline-variant/10 last:border-b-0"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Farm Size (Acres)')}</label>
              <input 
                type="number" 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                value={profile.farmSize}
                onChange={e => setProfile({...profile, farmSize: e.target.value})}
                placeholder={t('E.g., 5')}
              />
            </div>
          </div>

          <button 
            onClick={handleNext} 
            disabled={!profile.farmerName || !profile.location || !profile.farmSize}
            className="btn-primary w-full py-4 mt-8 disabled:opacity-90"
          >
            {t('Next')}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-right duration-300">
          <h2 className="text-headline-lg-mobile text-primary mb-6">{t('Crop Details')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Which crop are you growing?')}</label>
              <select 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary appearance-none"
                value={profile.crop}
                onChange={e => setProfile({...profile, crop: e.target.value})}
              >
                {crops.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Growth Stage')}</label>
              <select 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary appearance-none"
                value={profile.growthStage}
                onChange={e => setProfile({...profile, growthStage: e.target.value})}
              >
                {stages.map(s => <option key={s} value={s}>{t(s)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('Expected Yield Target (kg/acre)')}</label>
              <input 
                type="number" 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                value={profile.yieldTarget}
                onChange={e => setProfile({...profile, yieldTarget: e.target.value})}
                placeholder={t('E.g., 2000')}
              />
            </div>

            <div>
              <label className="block text-label-md text-gray-100 mb-1">{t('When did you sow?')}</label>
              <input 
                type="date" 
                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-primary"
                value={profile.sowDate}
                onChange={e => setProfile({...profile, sowDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={() => setStep(2)} className="w-1/3 bg-surface-variant text-gray-100 font-medium py-4 rounded-xl shadow-sm">
              {t('Back')}
            </button>
            <button 
              onClick={handleNext} 
              disabled={!profile.yieldTarget || !profile.sowDate}
              className="btn-primary w-2/3 py-4 disabled:opacity-90"
            >
              {t('Finish Setup')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
