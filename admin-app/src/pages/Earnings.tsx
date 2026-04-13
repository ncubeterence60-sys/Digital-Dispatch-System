import React, { useState, useEffect } from 'react'

interface Payout {
  id: number
  driverName: string
  amount: number
  status: 'pending' | 'paid' | 'rejected'
  date: string
}

const Earnings: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/admin/payouts')
      const data = await response.json()
      setPayouts(data)
    } catch (error) {
      console.error('Failed to fetch payouts')
    }
  }



  const approvePayout = async (id: number) => {
    try {
      await fetch(`/api/admin/payouts/${id}/approve`, { method: 'POST' })
      fetchPayouts()
    } catch (error) {
      console.error('Approval failed')
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Earnings & Settlements</h1>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold mb-6">Revenue vs Platform Fee</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart functionality is disabled in this build (recharts removed for compatibility).
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl shadow-xl border border-orange-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-orange-600">$14,508</div>
              <div className="text-orange-700 font-semibold">Total Revenue</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">$1,311</div>
              <div className="text-orange-700 font-semibold">Platform Fee (9%)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold mb-6">Pending Settlements</h3>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold">{payout.driverName}</div>
                  <div className="text-sm text-gray-500">{payout.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${payout.amount}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    payout.status === 'paid' ? 'bg-green-100 text-green-800' :
                    payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payout.status.toUpperCase()}
                  </span>
                </div>
                {payout.status === 'pending' && (
                  <button
                    onClick={() => approvePayout(payout.id)}
                    className="ml-4 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
                  >
                    Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold mb-6">Settlement Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 border-r border-gray-200">
              <div className="text-3xl font-bold text-emerald-600">$12,197</div>
              <div className="text-gray-600">Paid to Drivers</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-yellow-600">$565.50</div>
              <div className="text-gray-600">Pending Payouts</div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-center">
            <div className="text-2xl font-bold">$1,311</div>
            <div className="text-sm opacity-90">Platform Commission (9%)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Earnings

