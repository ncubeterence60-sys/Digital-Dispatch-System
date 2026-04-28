import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MqttProvider } from './contexts/MqttContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import Reports from './pages/Reports';
import Trips from './pages/Trips';
import Earnings from './pages/Earnings';
import Drivers from './pages/Drivers';
import MapPage from './pages/MapPage';
import Dispatch from './pages/Dispatch';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-xl text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
          <Header
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Reports />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MqttProvider>
        <AppContent />
      </MqttProvider>
    </AuthProvider>
  );
};

export default App;

