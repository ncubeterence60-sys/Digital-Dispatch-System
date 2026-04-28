import React from 'react';
import { useMqttContext } from '../contexts/MqttContext';

const MqttStatus: React.FC = () => {
  const { connected, status } = useMqttContext();

  if (connected) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span>MQTT</span>
      </div>
    );
  }

  if (status.reconnecting) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span>MQTT</span>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium" title={status.error}>
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>MQTT</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-gray-400" />
      <span>MQTT</span>
    </div>
  );
};

export default MqttStatus;

