import React, { useState } from 'react';

interface SettingsState {
  companyName: string;
  timezone: string;
  autoDispatch: boolean;
  notifications: boolean;
  mqttBroker: string;
  mapTheme: 'dark' | 'light' | 'satellite';
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    companyName: 'Digital Dispatch Zimbabwe',
    timezone: 'Africa/Harare',
    autoDispatch: false,
    notifications: true,
    mqttBroker: 'ws://localhost:9001',
    mapTheme: 'dark'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure system preferences and company profile</p>
      </div>

      {/* Company Profile */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Company Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={e => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="Africa/Harare">Africa/Harare (CAT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispatch Settings */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Dispatch Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
            <div>
              <p className="text-white font-medium">Auto Dispatch</p>
              <p className="text-slate-400 text-sm">Automatically assign nearest driver to new requests</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoDispatch: !settings.autoDispatch })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.autoDispatch ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.autoDispatch ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-slate-400 text-sm">Receive alerts for new trips and driver updates</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.notifications ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* MQTT / IoT Settings */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">IoT &amp; Connectivity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">MQTT Broker URL</label>
            <input
              type="text"
              value={settings.mqttBroker}
              onChange={e => setSettings({ ...settings, mqttBroker: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Map Theme</label>
            <select
              value={settings.mapTheme}
              onChange={e => setSettings({ ...settings, mapTheme: e.target.value as any })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`px-8 py-3 rounded-xl font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
          }`}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;

