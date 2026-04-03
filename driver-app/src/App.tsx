import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
// Removed unused io import
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import { ioSocket } from './services/socket'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check auth token
    const token = localStorage.getItem('driverToken')
    if (token) {
      setIsAuthenticated(true)
      ioSocket.connect()
    }
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('driverToken', token)
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('driverToken')
    setIsAuthenticated(false)
    ioSocket.disconnect()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
      </Routes>
    </div>
  )
}

export default App

