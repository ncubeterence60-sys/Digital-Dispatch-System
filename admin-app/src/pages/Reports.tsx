import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Mock data - replace with API calls
const reportsData = [
  { name: 'Jan', trips: 120, revenue: 4500, drivers: 25 },
  { name: 'Feb', trips: 150, revenue: 5800, drivers: 28 },
  { name: 'Mar', trips: 200, revenue: 7200, drivers: 32 },
  { name: 'Apr', trips: 180, revenue: 6500, drivers: 30 },
]

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingPayouts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error('Stats error:', err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[250px] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-2xl">
          <div className="text-3xl font-bold">{stats.totalTrips}</div>
          <div className="text-blue-100">Total Trips</div>
        </div>
        <div className="flex-1 min-w-[250px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl">
          <div className="text-3xl font-bold">${stats.totalRevenue}</div>
          <div className="text-emerald-100">Total Revenue</div>
        </div>
        <div className="flex-1 min-w-[250px] bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-2xl">
          <div className="text-3xl font-bold">{stats.activeDrivers}</div>
          <div className="text-purple-100">Active Drivers</div>
        </div>
        <div className="flex-1 min-w-[250px] bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-2xl">
          <div className="text-3xl font-bold">${stats.pendingPayouts}</div>
          <div className="text-orange-100">Pending Payouts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Monthly Revenue</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Revenue data available
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Driver Distribution</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Driver stats available
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Trip Trends</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart placeholder - Trip trends available
        </div>
      </div>
    </div>
  )
}

export default Reports

