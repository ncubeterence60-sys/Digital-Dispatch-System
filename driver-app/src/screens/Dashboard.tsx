import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation, Phone, UserCheck } from 'lucide-react'

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Trip {
  id: number
  customer: string
  pickup: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  price: number
}

interface Props {
  onLogout: () => void
}

const Dashboard: React.FC<Props> = ({ onLogout }) => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline')
  const [currentTrips, setCurrentTrips] = useState<Trip[]>([])
  const [position, setPosition] = useState<[number, number]>([-17.8252, 31.0335])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [earnings, setEarnings] = useState(0)
  const socket = io('http://localhost:3000')

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
      },
      undefined,
      { enableHighAccuracy: true }
    )

    socket.on('newTrip', (trip: Trip) => {
      setCurrentTrips(prev => [...prev, trip])
    })

    return () => socket.disconnect()
  }, [])

  const toggleStatus = () => {
    const newStatus = status === 'online' ? 'offline' : 'online'
    setStatus(newStatus)
    
    // Send status to server
    fetch('/api/drivers/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, position })
    })
  }

  const acceptTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    fetch('/api/drivers/trip/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: trip.id })
    })
  }

  const completeTrip = () => {
    if (selectedTrip) {
      setEarnings(prev => prev + selectedTrip.price)
      setCurrentTrips(prev => prev.filter(t => t.id !== selectedTrip.id))
      setSelectedTrip(null)
      
      fetch('/api/drivers/trip/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: selectedTrip.id })
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Today's Earnings</div>
            <div className="text-2xl font-bold text-emerald-600">${earnings.toFixed(2)}</div>
          </div>
          <button onClick={onLogout} className="btn-primary text-sm px-4 py-2">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Live Map</h2>
              <button
                onClick={toggleStatus}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  status === 'online'
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                }`}
              >
                {status === 'online' ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
            
            <MapContainer center={position} zoom={13} className="map-container">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>Your Location</Popup>
              </Marker>
              {selectedTrip && (
                <>
                  <Marker position={[selectedTrip.pickup.lat, selectedTrip.pickup.lng]}>
                    <Popup>Pickup</Popup>
                  </Marker>
                  <Marker position={[selectedTrip.destination.lat, selectedTrip.destination.lng]}>
                    <Popup>Destination</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Trips Panel */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl p-6 h-[500px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Available Trips ({currentTrips.length})
            </h3>
            
            <div className="space-y-4">
              {currentTrips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Navigation className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No trips available</p>
                  <p className="text-sm">Go online to receive trips</p>
                </div>
              ) : (
                currentTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">${trip.price}</h4>
                        <p className="text-sm text-gray-600">{trip.customer}</p>
                      </div>
                      <div className="text-right">
                        <Phone className="w-4 h-4 text-emerald-600 mb-1 block" />
                        <div className="text-xs text-gray-500">Call</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                      <div>Pickup</div>
                      <div className="font-semibold">{trip.pickup.lat.toFixed(4)}, {trip.pickup.lng.toFixed(4)}</div>
                      <div>Dropoff</div>
                      <div className="font-semibold">{trip.destination.lat.toFixed(4)}, {trip.destination.lng.toFixed(4)}</div>
                    </div>
                    <button
                      onClick={() => acceptTrip(trip)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Accept Trip
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Trip Footer */}
      {selectedTrip && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-96 bg-white rounded-2xl shadow-2xl p-6 border">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-emerald-600" />
            Current Trip: {selectedTrip.customer}
          </h3>
          <div className="space-y-3 mb-6">
            <div>Price: <span className="font-bold text-emerald-600">${selectedTrip.price}</span></div>
            <div>Pickup ready: <span className="font-semibold text-emerald-600">Yes</span></div>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all">
              Start Trip
            </button>
            <button 
              onClick={completeTrip}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all"
            >
              Complete Trip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

