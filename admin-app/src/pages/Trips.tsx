import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, Download, UserPlus, X, Check } from 'lucide-react'

interface Trip {
  id: number
  customer: string
  driver: string
  pickup: string
  dropoff: string
  price: number
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  date: string
}

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTrips()
  }, [])

  const { token } = useAuth();

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/admin/trips', {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      const data = await response.json()
      setTrips(data)
    } catch (error) {
      console.error('Failed to fetch trips', error)
    }
  }

  const filteredTrips = trips.filter(trip => 
    filter === 'all' || trip.status === filter
  )

  const assignDriver = async (tripId: number, driverId: string) => {
    try {
      await fetch(`/api/admin/trips/${tripId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      });
      fetchTrips(); // Refresh data
    } catch (error) {
      console.error('Failed to assign driver');
    }
  };

  const cancelTrip = async (tripId: number) => {
    if (confirm('Are you sure you want to cancel this trip?')) {
      try {
        await fetch(`/api/admin/trips/${tripId}/cancel`, {
          method: 'POST'
        });
        fetchTrips(); // Refresh data
      } catch (error) {
        console.error('Failed to cancel trip');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Trip Lists</h1>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
            {filteredTrips.length} trips
          </span>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dropoff</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
{filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{trip.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.driver || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.pickup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.dropoff}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                    ${trip.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                      trip.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trip.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {trip.status === 'pending' && (
                        <button
                          onClick={() => assignDriver(trip.id, 'auto')} // In real app, show driver selection modal
                          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assign
                        </button>
                      )}
                      {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelTrip(trip.id)}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                      {trip.status === 'accepted' && (
                        <button
                          onClick={() => {/* Mark as completed */}}
                          className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                        >
                          <Check className="w-3 h-3" />
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trips match the selected filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Trips

