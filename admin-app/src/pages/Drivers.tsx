import React, { useState, useEffect } from 'react'
import { UserPlus, CheckCircle, XCircle, Phone, MapPin } from 'lucide-react'

interface Driver {
  id: number
  name: string
  phone: string
  status: 'online' | 'offline' | 'busy'
  rating: number
  tripsCompleted: number
  earnings: number
  location: string
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('pending')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/admin/drivers')
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      console.error('Failed to fetch drivers')
    }
  }

  const approveDriver = async (id: number) => {
    try {
      await fetch(`/api/admin/drivers/${id}/approve`, { method: 'POST' })
      fetchDrivers()
    } catch (error) {
      console.error('Approval failed')
    }
  }

  const mockDrivers = [
    { id: 1, name: 'John Doe', phone: '+263712345678', status: 'online', rating: 4.8, tripsCompleted: 245, earnings: 12450, location: 'Harare CBD' },
    { id: 2, name: 'Sarah Smith', phone: '+263772345678', status: 'busy', rating: 4.9, tripsCompleted: 189, earnings: 9870, location: 'Eastlea' },
    { id: 3, name: 'Mike Johnson', phone: '+263732345678', status: 'offline', rating: 4.2, tripsCompleted: 67, earnings: 3420, location: 'Bulawayo' },
    { id: 4, name: 'New Driver', phone: '+263789012345', status: 'offline', rating: 0, tripsCompleted: 0, earnings: 0, location: 'Pending' }
  ]

  const filteredDrivers = mockDrivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone.includes(search)
  )

  const statusBadges = {
    online: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    busy: 'bg-amber-100 text-amber-800 border-amber-200',
    offline: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Approvals</h1>
          <p className="text-gray-600 mt-1">Manage driver accounts and settlements</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-gray-200 rounded-xl p-2">
            <Search className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 outline-none bg-transparent placeholder-gray-400"
            />
          </div>
          <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold shadow-lg hover:shadow-xl transition-all">
            + New Driver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-8 rounded-2xl shadow-xl grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">28</div>
            <div className="text-gray-600 font-semibold">Active Drivers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600 font-semibold">Pending Approval</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl shadow">
          <div className="flex gap-1 bg-white rounded-xl p-1">
            {['all', 'pending', 'approved', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedTab === tab
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Trips</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mr-3">
                        <span className="font-bold text-white text-sm">{driver.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusBadges[driver.status as keyof typeof statusBadges]
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= driver.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-500">{driver.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {driver.tripsCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-emerald-600">${driver.earnings.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {driver.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {driver.status === 'offline' && driver.tripsCompleted === 0 ? (
                      <button
                        onClick={() => approveDriver(driver.id)}
                        className="text-emerald-600 hover:text-emerald-900 font-semibold px-3 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <>
                        <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-100">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100">
                          Edit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-16">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <button className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            + Add New Driver
          </button>
        </div>
      )}
    </div>
  )
}

export default Drivers

