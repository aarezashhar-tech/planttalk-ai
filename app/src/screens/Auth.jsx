import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const Auth = ({ setSession, onLogin, setCurrentScreen }) => {
  const { t } = useTranslation();
  
  const [sessionData, setSessionData] = useState(null);
  const [view, setView] = useState('options'); // 'options', 'returning'
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
      const res = await fetch(`https://planttalk-ai.onrender.com/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gmail', contact: email })
      });
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        data.contact = email;
        data.name = name;
        data.picture = picture;
        data.auth_provider = 'gmail';
        localStorage.setItem('planttalk_session', JSON.stringify(data));
        // Force immediate redirect — don't rely on React state
        window.location.replace('/');
        return; // prevent further execution
      } else {
        console.error('Backend authentication failed:', data);
      }
    } catch (e) {
      console.error('Backend error during Google Sign-In:', e.message);
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
      localStorage.setItem('planttalk_session', JSON.stringify(sessionData));
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        // Force full page reload to pick up session state reliably
        window.location.replace('/');
      } else {
        window.location.replace('/onboarding');
      }
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem('planttalk_session');
    setSessionData(null);
    setView('options');
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
              <p className="mb-4 text-gray-100 font-medium">{t('You are already logged in as')} <br/><span className="text-primary font-bold">{sessionData?.contact}</span></p>
              <button onClick={handleContinue} className="w-full btn-primary py-3 mb-3 rounded-xl">
                {t('Continue')}
              </button>
              <button onClick={handleClearSession} className="w-full text-error text-sm font-medium py-2">
                {t('Login with different account')}
              </button>
            </div>
          )}

          {view === 'options' && (
            <>
              {loading && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-100 text-sm">{t('Signing you in...')}</span>
                </div>
              )}
              <div id="google-signIn-btn" className="w-full flex justify-center mt-2"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
