import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';

const MapPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Array<{
    id: string;
    name: string;
    position: [number, number];
    status: 'online' | 'offline' | 'busy';
  }>>([]);
  const [trips, setTrips] = useState<Array<{
    id: string;
    pickup: [number, number];
    dropoff: [number, number];
    status: 'pending' | 'active' | 'completed';
  }>>([]);

  useEffect(() => {
    // Fetch drivers and trips data
    const fetchData = async () => {
      try {
        const [driversRes, tripsRes] = await Promise.all([
          fetch('/api/admin/drivers'),
          fetch('/api/admin/trips/active')
        ]);

        if (driversRes.ok) {
          const driversData = await driversRes.json();
          setDrivers(driversData.map((d: any) => ({
            id: d.id,
            name: d.name,
            position: [d.lat, d.lng] as [number, number],
            status: d.status
          })));
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData.map((t: any) => ({
            id: t.id,
            pickup: [t.pickupLat, t.pickupLng] as [number, number],
            dropoff: [t.dropoffLat, t.dropoffLng] as [number, number],
            status: t.status
          })));
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const driverMarkers = drivers.map(driver => ({
    position: driver.position,
    popup: `${driver.name} - ${driver.status}`
  }));

  const tripMarkers = trips.flatMap(trip => [
    {
      position: trip.pickup,
      popup: `Pickup - Trip ${trip.id}`
    },
    {
      position: trip.dropoff,
      popup: `Dropoff - Trip ${trip.id}`
    }
  ]);

  const allMarkers = [...driverMarkers, ...tripMarkers];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Street Map</h1>

      <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Online Drivers ({drivers.filter(d => d.status === 'online').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Busy Drivers ({drivers.filter(d => d.status === 'busy').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Active Trips ({trips.filter(t => t.status === 'active').length})</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <MapComponent
          center={[40.7128, -74.0060]} // NYC coordinates
          zoom={12}
          markers={allMarkers}
          className="h-[600px] w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default MapPage;