import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, UserPlus, MapPin, X } from 'lucide-react'

interface Vehicle {
  id: number
  make: string
  model: string
  license: string
  color: string | null
}

interface Driver {
  id: number
  name: string
  phone: string | null
  status: string
  lat: number | null
  lng: number | null
  vehicle: Vehicle | null
}

const Drivers: React.FC = () => {
  const { token } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleLicense: '',
    vehicleColor: ''
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/admin/drivers', {
        headers: { Authorization: 'Bearer ' + (token || '') }
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setDrivers(data)
      } else {
        console.error('Invalid drivers response:', data)
        setDrivers([])
      }
    } catch (error) {
      console.error('Failed to fetch drivers', error)
      setDrivers([])
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + (token || ''),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDriver)
      })
      if (response.ok) {
        setShowModal(false)
        setNewDriver({ name: '', phone: '', vehicleMake: '', vehicleModel: '', vehicleLicense: '', vehicleColor: '' })
        fetchDrivers()
      } else {
        const err = await response.json()
        alert('Failed to add driver: ' + (err.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Add driver failed', error)
      alert('Network error adding driver')
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    (driver.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (driver.phone || '').includes(search)
  )

  const statusBadges: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    BUSY: 'bg-amber-100 text-amber-800 border-amber-200',
    OFFLINE: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const tabFilteredDrivers = selectedTab === 'all'
    ? filteredDrivers
    : filteredDrivers.filter(d => d.status.toLowerCase() === selectedTab.toLowerCase())

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600 mt-1">Manage driver accounts and fleet</p>
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
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            New Driver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">
              {drivers.filter(d => d.status === 'AVAILABLE').length}
            </div>
            <div className="text-gray-600 font-semibold">Active Drivers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {drivers.length}
            </div>
            <div className="text-gray-600 font-semibold">Total Drivers</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl shadow">
          <div className="flex gap-1 bg-white rounded-xl p-1">
            {['all', 'available', 'busy', 'offline'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={'flex-1 py-3 px-4 rounded-lg font-semibold transition-all ' + (
                  selectedTab === tab
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tabFilteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mr-3">
                        <span className="font-bold text-white text-sm">
                          {driver.name?.split(' ').map((n) => n[0]).join('') || 'D'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">ID: #{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (
                      statusBadges[driver.status] || 'bg-gray-100 text-gray-800'
                    )}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.vehicle ? (
                      <div>
                        {driver.vehicle.make} {driver.vehicle.model}
                        <span className="text-gray-500 text-xs ml-1">({driver.vehicle.license})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No vehicle</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.lat && driver.lng ? (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-xs text-gray-600">
                          {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Offline</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-100">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tabFilteredDrivers.length === 0 && (
        <div className="text-center py-16">
          <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            + Add New Driver
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={newDriver.name}
                  onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={newDriver.phone}
                  onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="263777123456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={newDriver.vehicleMake}
                    onChange={e => setNewDriver({ ...newDriver, vehicleMake: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={newDriver.vehicleModel}
                    onChange={e => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Corolla"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">License Plate</label>
                  <input
                    type="text"
                    value={newDriver.vehicleLicense}
                    onChange={e => setNewDriver({ ...newDriver, vehicleLicense: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={newDriver.vehicleColor}
                    onChange={e => setNewDriver({ ...newDriver, vehicleColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="White"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Drivers

