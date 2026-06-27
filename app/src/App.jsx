import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MobileBottomNav from './components/MobileBottomNav';
import HomeDashboard from './screens/HomeDashboard';
import { PlantDoctor } from './screens/PlantDoctor';
import IndiaForecast from './screens/IndiaForecast';
import { Community } from './screens/Community';
import { Settings } from './screens/Settings';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';

function AppContent() {
  const location = useLocation();
  const hasSession = !!localStorage.getItem('planttalk_session');
  const hasProfile = !!localStorage.getItem('userProfile');
  const isFullyAuthenticated = hasSession && hasProfile;

  // Don't show bottom nav on auth/onboarding pages
  const showMobileNav = isFullyAuthenticated && !['/login', '/auth', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0F1C14] text-white font-sans">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          hasSession ? (hasProfile ? <Navigate to="/" /> : <Navigate to="/onboarding" />) 
          : <Auth setSession={() => window.location.href = '/'} onLogin={() => window.location.href = '/'} setCurrentScreen={() => window.location.href = '/'} />
        } />
        <Route path="/auth" element={<Navigate to="/login" />} />
        
        {/* Onboarding Route */}
        <Route path="/onboarding" element={
          !hasSession ? <Navigate to="/login" /> 
          : (hasProfile ? <Navigate to="/" /> : <Onboarding onComplete={() => window.location.href = '/'} />)
        } />
        
        {/* Protected Dashboard Routes */}
        <Route path="/" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <HomeDashboard />)} />
        <Route path="/dashboard" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <HomeDashboard />)} />
        <Route path="/doctor" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <PlantDoctor />)} />
        <Route path="/india" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <IndiaForecast />)} />
        <Route path="/india-forecast" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <IndiaForecast />)} />
        <Route path="/community" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <Community />)} />
        <Route path="/settings" element={!hasSession ? <Navigate to="/login" /> : (!hasProfile ? <Navigate to="/onboarding" /> : <Settings />)} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Mobile Bottom Tab Bar — visible only on mobile (<768px) */}
      {showMobileNav && <MobileBottomNav />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
