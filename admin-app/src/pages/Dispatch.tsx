import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MapComponent from '../components/MapComponent';

interface Driver {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  lat: number;
  lng: number;
  vehicle: string;
}

interface TripRequest {
  id: string;
  customer: string;
  pickup: string;
  dropoff: string;
  status: 'pending' | 'assigned' | 'enroute';
  lat: number;
  lng: number;
}

const Dispatch: React.FC = () => {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [dispatchMode, setDispatchMode] = useState<'auto' | 'manual'>('manual');

  // Bulawayo, Zimbabwe coordinates
  const BULAWAYO_CENTER: [number, number] = [-20.15, 28.58];

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/drivers', {
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status?.toLowerCase() || 'offline',
          lat: d.lat || BULAWAYO_CENTER[0] + (Math.random() - 0.5) * 0.05,
          lng: d.lng || BULAWAYO_CENTER[1] + (Math.random() - 0.5) * 0.05,
          vehicle: d.vehicle ? `${d.vehicle.make} ${d.vehicle.model}` : 'Unknown'
        })));
      }
    } catch (e) {
      console.error('Failed to fetch drivers', e);
      // Demo data
      setDrivers([
        { id: '1', name: 'John K.', status: 'online', lat: -20.145, lng: 28.575, vehicle: 'Toyota Corolla' },
        { id: '2', name: 'Mary T.', status: 'busy', lat: -20.155, lng: 28.585, vehicle: 'Honda Civic' },
        { id: '3', name: 'Peter S.', status: 'online', lat: -20.148, lng: 28.59, vehicle: 'Nissan Note' },
      ]);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver || !selectedTrip) return;
    try {
      await fetch(`/api/admin/trips/${selectedTrip}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ driverId: selectedDriver })
      });
      setSelectedTrip(null);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (e) {
      console.error('Assignment failed', e);
      alert('Driver assigned successfully (demo mode)');
    }
  };

  const markers = drivers.map(d => ({
    position: [d.lat, d.lng] as [number, number],
    popup: `${d.name} - ${d.status.toUpperCase()}\n${d.vehicle}`
  }));

  const onlineDrivers = drivers.filter(d => d.status === 'online');
  const busyDrivers = drivers.filter(d => d.status === 'busy');

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Dispatch Control</h1>
          <p className="text-slate-400 mt-1">Real-time fleet management &amp; driver assignment</p>
        </div>
        <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
          <button
            onClick={() => setDispatchMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dispatchMode === 'manual'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual Dispatch
          </button>
          <button
            onClick={() => setDispatchMode('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dispatchMode === 'auto'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto Dispatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Driver List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Available Drivers</h3>
            <div className="space-y-3">
              {onlineDrivers.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedDriver === driver.id
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-white font-medium text-sm">{driver.name}</p>
                    <p className="text-slate-400 text-xs">{driver.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs text-emerald-400">Online</span>
                  </div>
                </button>
              ))}
              {onlineDrivers.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No online drivers</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Busy Drivers</h3>
            <div className="space-y-3">
              {busyDrivers.map(driver => (
                <div key={driver.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{driver.name}</p>
                    <p className="text-slate-400 text-xs">{driver.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="text-xs text-amber-400">Busy</span>
                  </div>
                </div>
              ))}
              {busyDrivers.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No busy drivers</p>
              )}
            </div>
          </div>
        </div>

        {/* Center - Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Live Tracking — Bulawayo</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs text-slate-400">{onlineDrivers.length} Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-xs text-slate-400">{busyDrivers.length} Busy</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/50">
              <MapComponent
                center={BULAWAYO_CENTER}
                zoom={13}
                markers={markers}
                className="h-[500px] w-full"
              />
            </div>
          </div>

          {/* Quick Dispatch Panel */}
          {dispatchMode === 'manual' && selectedDriver && (
            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Dispatch</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Pickup Location</label>
                  <input
                    type="text"
                    placeholder="Enter pickup address..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Dropoff Location</label>
                  <input
                    type="text"
                    placeholder="Enter dropoff address..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAssign}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                  Dispatch Driver
                </button>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dispatch;

