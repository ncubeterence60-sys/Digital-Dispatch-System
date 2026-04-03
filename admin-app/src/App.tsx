import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Reports from './pages/Reports'
import Trips from './pages/Trips'
import Earnings from './pages/Earnings'
import Drivers from './pages/Drivers'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Reports />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/drivers" element={<Drivers />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App

