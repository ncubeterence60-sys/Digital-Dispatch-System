import React from 'react';
import { useMqttContext } from '../contexts/MqttContext';

interface Esp32Device {
  id: string;
  name: string;
  rssi: number;
  status: 'online' | 'offline' | 'warning';
  lastSeen: Date;
  battery?: number;
}

const Esp32Signals: React.FC = () => {
  const { connected, messages } = useMqttContext();

  // Parse ESP32 devices from MQTT messages
  const devices: Esp32Device[] = React.useMemo(() => {
    const deviceMap = new Map<string, Esp32Device>();
    
    messages.forEach(msg => {
      if (msg.topic.startsWith('esp32/')) {
        try {
          const data = JSON.parse(msg.message);
          const deviceId = data.deviceId || msg.topic.split('/')[1];
          deviceMap.set(deviceId, {
            id: deviceId,
            name: data.name || `ESP32-${deviceId.slice(-4)}`,
            rssi: data.rssi ?? -85,
            status: data.status || 'online',
            lastSeen: msg.timestamp,
            battery: data.battery
          });
        } catch {
          // Non-JSON message, skip
        }
      }
    });

    // Add demo devices if none found
    if (deviceMap.size === 0 && connected) {
      deviceMap.set('demo1', {
        id: 'demo1',
        name: 'Tracker-01',
        rssi: -72,
        status: 'online',
        lastSeen: new Date(),
        battery: 85
      });
      deviceMap.set('demo2', {
        id: 'demo2',
        name: 'Tracker-02',
        rssi: -91,
        status: 'warning',
        lastSeen: new Date(),
        battery: 32
      });
    }

    return Array.from(deviceMap.values());
  }, [messages, connected]);

  const getRssiColor = (rssi: number) => {
    if (rssi > -70) return 'text-emerald-400';
    if (rssi > -85) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRssiBars = (rssi: number) => {
    const bars = rssi > -70 ? 4 : rssi > -80 ? 3 : rssi > -90 ? 2 : 1;
    return bars;
  };

  if (!connected && devices.length === 0) {
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <span className="text-xs text-slate-500">ESP32 Offline</span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors">
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
      <div className="flex items-center gap-1.5">
        {devices.slice(0, 2).map(device => (
          <div key={device.id} className="flex items-center gap-1" title={`${device.name}: ${device.rssi}dBm`}>
            <div className="flex items-end gap-0.5 h-3">
              {[1, 2, 3, 4].map(bar => (
                <div
                  key={bar}
                  className={`w-0.5 rounded-sm ${bar <= getRssiBars(device.rssi) ? getRssiColor(device.rssi) : 'bg-slate-700'}`}
                  style={{ height: `${bar * 3}px` }}
                />
              ))}
            </div>
            {device.battery !== undefined && device.battery < 30 && (
              <span className="text-[10px] text-red-400">{device.battery}%</span>
            )}
          </div>
        ))}
        {devices.length > 2 && (
          <span className="text-xs text-slate-400">+{devices.length - 2}</span>
        )}
      </div>
    </div>
  );
};

export default Esp32Signals;

