import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface MqttMessage {
  topic: string;
  message: string;
  timestamp: Date;
}

export interface Esp32Telemetry {
  deviceId: string;
  rssi: number;
  battery: number;
  status: 'online' | 'offline' | 'warning';
  lat?: number;
  lng?: number;
  timestamp: Date;
}

export interface MqttStatus {
  connected: boolean;
  reconnecting?: boolean;
  offline?: boolean;
  error?: string;
}

interface MqttContextType {
  connected: boolean;
  status: MqttStatus;
  messages: MqttMessage[];
  lastMessage: MqttMessage | null;
  esp32Devices: Esp32Telemetry[];
  clearMessages: () => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const useMqttContext = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error('useMqttContext must be used within a MqttProvider');
  }
  return context;
};

interface MqttProviderProps {
  children: ReactNode;
}

const MAX_MESSAGES = 100;

export const MqttProvider: React.FC<MqttProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<MqttStatus>({ connected: false });
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<MqttMessage | null>(null);
  const [esp32Devices, setEsp32Devices] = useState<Esp32Telemetry[]>([]);

  useEffect(() => {
    if (!window.electronAPI) {
      console.warn('electronAPI not available - running in browser mode');
      return;
    }

    const unsubStatus = window.electronAPI.on('mqtt-status', (newStatus: MqttStatus) => {
      console.log('MQTT status:', newStatus);
      setStatus(newStatus);
    });

    const unsubMessage = window.electronAPI.on('mqtt-message', (data: { topic: string; message: string }) => {
      const msg: MqttMessage = {
        topic: data.topic,
        message: data.message,
        timestamp: new Date()
      };
      setLastMessage(msg);
      setMessages(prev => {
        const updated = [msg, ...prev];
        return updated.slice(0, MAX_MESSAGES);
      });

      // Parse ESP32 telemetry
      if (data.topic.startsWith('esp32/') || data.topic.startsWith('tracker/')) {
        try {
          const payload = JSON.parse(data.message);
          const deviceId = payload.deviceId || data.topic.split('/')[1] || 'unknown';
          setEsp32Devices(prev => {
            const filtered = prev.filter(d => d.deviceId !== deviceId);
            return [{
              deviceId,
              rssi: payload.rssi ?? -85,
              battery: payload.battery ?? 100,
              status: payload.status || 'online',
              lat: payload.lat,
              lng: payload.lng,
              timestamp: new Date()
            }, ...filtered].slice(0, 50);
          });
        } catch {
          // Not JSON, skip ESP32 parsing
        }
      }
    });

    return () => {
      unsubStatus?.();
      unsubMessage?.();
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  const value: MqttContextType = {
    connected: status.connected,
    status,
    messages,
    lastMessage,
    esp32Devices,
    clearMessages
  };

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
};

