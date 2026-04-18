import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dashboard, FileText, DollarSign, Users, MapIcon, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Admin Panel
        </h1>
        <p className="text-slate-400 text-sm mt-1">Digital Dispatch</p>
      </div>

      <nav className="p-6 space-y-2">
        <Link
          to="/"
          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
            isActive('/') ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
<Dashboard className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Dashboard</span>
        </Link>
        <Link
          to="/trips"
          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
            isActive('/trips') ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Trip Management</span>
        </Link>
        <Link
          to="/drivers"
          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
            isActive('/drivers') ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
          <Users className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Driver Status</span>
        </Link>
        <Link
          to="/map"
          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
            isActive('/map') ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
          <MapIcon className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Street Map</span>
        </Link>
        <Link
          to="/earnings"
          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
            isActive('/earnings') ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Earnings</span>
        </Link>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

