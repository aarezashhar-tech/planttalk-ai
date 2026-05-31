import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const Auth = ({ setSession, onLogin, setCurrentScreen }) => {
  const { t } = useTranslation();
  
  const [sessionData, setSessionData] = useState(null);
  const [view, setView] = useState('options'); // 'options', 'phone', 'otp', 'returning'
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('planttalk_session');
    if (existing) {
      setSessionData(JSON.parse(existing));
      setView('returning');
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    const token = response.credential;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gmail', contact: email })
      });
      const data = await res.json();
      if (data.success) {
        data.contact = email;
        data.name = name;
        data.picture = picture;
        data.auth_provider = 'gmail';
        localStorage.setItem('planttalk_session', JSON.stringify(data));
        setSession(data);
        setCurrentScreen('onboarding');
      }
    } catch (e) {
      console.warn('Backend err:', e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && view === 'options') {
        window.google.accounts.id.initialize({
          client_id: '909272867199-m6bn6thg6adco4agajtsojada32jj4pq.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });
        const btnContainer = document.getElementById('google-signIn-btn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: btnContainer.offsetWidth || 300 }
          );
        }
      }
    };

    if (view === 'options') {
      if (window.google) {
        initGoogle();
      } else {
        const timer = setInterval(() => {
          if (window.google) {
            clearInterval(timer);
            initGoogle();
          }
        }, 100);
        return () => clearInterval(timer);
      }
    }
  }, [view]);

  const handleContinue = () => {
    if (sessionData) {
      setSession(sessionData);
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        onLogin(JSON.parse(profile));
      } else {
        setCurrentScreen('onboarding');
      }
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem('planttalk_session');
    setSessionData(null);
    setView('options');
  };

  const submitPhone = async () => {
    if (!contact) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'phone', contact })
      });
      const data = await res.json();
      if (data.status === 'otp_sent') {
        setView('otp');
      }
    } catch (e) {
      console.warn('Backend err:', e.message);
    }
    setLoading(false);
  };

  const submitOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'phone', contact, otp })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('planttalk_session', JSON.stringify(data));
        setSession(data);
        setCurrentScreen('onboarding');
      }
    } catch (e) {
      console.warn('Backend err:', e.message);
    }
    setLoading(false);
  };

  const submitGuest = () => {
    const guestSession = { success: true, contact: 'Guest User', user_id: 'guest_123' };
    const guestProfile = {
      farmerName: 'Guest Farmer',
      crop: 'Tomato',
      location: 'Coimbatore',
      state: 'Tamil Nadu',
      latitude: 11.0168,
      longitude: 76.9558,
      farmSize: 2,
      growthStage: 'Vegetative',
      sowDate: new Date().toISOString()
    };
    
    localStorage.setItem('planttalk_session', JSON.stringify(guestSession));
    localStorage.setItem('userProfile', JSON.stringify(guestProfile));
    
    if (setSession) setSession(guestSession);
    if (onLogin) {
      onLogin(guestProfile);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-24 text-on-background font-body">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary text-on-primary rounded-[2rem] mx-auto flex items-center justify-center text-5xl font-bold shadow-card">
          🌱
        </div>
        <div>
          <h1 className="text-display-lg text-primary mb-2">PlantTalk AI</h1>
          <p className="text-headline-md text-gray-100 font-normal">{t('Welcome')}</p>
        </div>
        
        <div className="space-y-4 w-full pt-8">
          {view === 'returning' && (
            <div className="bg-surface-variant/30 p-6 rounded-2xl border border-outline-variant/30">
              <p className="mb-4 text-gray-100 font-medium">You are already logged in as <br/><span className="text-primary font-bold">{sessionData?.contact}</span></p>
              <button onClick={handleContinue} className="w-full btn-primary py-3 mb-3 rounded-xl">
                Continue
              </button>
              <button onClick={handleClearSession} className="w-full text-error text-sm font-medium py-2">
                Login with different account
              </button>
            </div>
          )}

          {view === 'options' && (
            <>
              <button onClick={() => setView('phone')} className="w-full bg-surface-variant/50 border border-outline-variant text-gray-100 py-4 rounded-xl font-medium transition-colors hover:bg-surface-variant">
                {t('Login with Mobile (OTP)')}
              </button>
              
              <div id="google-signIn-btn" className="w-full flex justify-center mt-2"></div>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant/50"></div>
                <span className="flex-shrink-0 mx-4 text-gray-100 text-sm">or</span>
                <div className="flex-grow border-t border-outline-variant/50"></div>
              </div>
              
              <button onClick={submitGuest} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold transition-colors hover:bg-slate-700 shadow-md">
                {t('Continue as Guest')}
              </button>
            </>
          )}

          {view === 'phone' && (
            <div className="space-y-4">
              <input 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full bg-surface p-4 rounded-xl border border-outline-variant text-white"
                value={contact}
                onChange={e => setContact(e.target.value)}
              />
              <button onClick={submitPhone} disabled={loading} className="w-full btn-primary py-4 rounded-xl">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <button onClick={() => setView('options')} className="w-full text-gray-100 text-sm mt-2">Back</button>
            </div>
          )}

          {view === 'otp' && (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="4-digit OTP" 
                maxLength="4"
                className="w-full bg-surface p-4 rounded-xl border border-outline-variant text-white text-center tracking-[1em] font-bold"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <button onClick={submitOtp} disabled={loading} className="w-full btn-primary py-4 rounded-xl">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button onClick={() => setView('phone')} className="w-full text-gray-100 text-sm mt-2">Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
