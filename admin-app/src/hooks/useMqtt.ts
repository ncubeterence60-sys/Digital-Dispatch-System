import { useEffect } from 'react';

export interface MqttMessage {
  topic: string;
  message: string;
}

export const useMqtt = (callback: (msg: MqttMessage) => void) => {
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleMqttMessage = (msg: MqttMessage) => {
      callback(msg);
    };

    const unsubscribe = window.electronAPI.on('mqtt-message', handleMqttMessage);

    return () => {
      unsubscribe?.();
    };
  }, [callback]);
};

