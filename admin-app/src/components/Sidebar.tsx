import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, DollarSign, Users, MapIcon, LogOut, Shield, Sparkles, Settings, MessageSquare, Radio } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CompanyHeader from './CompanyHeader'

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/dispatch', label: 'Dispatch', icon: <Radio className="w-5 h-5" /> },
    { path: '/trips', label: 'Trips', icon: <FileText className="w-5 h-5" /> },
    { path: '/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
    { path: '/map', label: 'Live Map', icon: <MapIcon className="w-5 h-5" /> },
    { path: '/earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
    { path: '/feedback', label: 'Feedback', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  if (collapsed) {
    return (
      <div className="sidebar flex flex-col w-20">
        <CompanyHeader collapsed />
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`flex items-center justify-center p-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={isActive(item.path) ? 'text-emerald-400' : ''}>{item.icon}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700/50">
          <button
            onClick={logout}
            title="Logout"
            className="flex items-center justify-center p-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-slate-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar flex flex-col">
      <CompanyHeader />

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className={isActive(item.path) ? 'text-emerald-400' : ''}>{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {isActive(item.path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50 space-y-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">System Secure</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left text-slate-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

