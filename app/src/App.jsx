import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomeDashboard from './screens/HomeDashboard';
import { PlantDoctor } from './screens/PlantDoctor';
import IndiaForecast from './screens/IndiaForecast';
import { Community } from './screens/Community';
import { Settings } from './screens/Settings';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';

export default function App() {
  const hasSession = !!localStorage.getItem('planttalk_session');
  const hasProfile = !!localStorage.getItem('userProfile');
  const isFullyAuthenticated = hasSession && hasProfile;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
        {isFullyAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isFullyAuthenticated ? 'ml-[250px]' : ''} p-8`}>
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
        </main>
      </div>
  );
}
