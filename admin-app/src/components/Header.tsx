import React from 'react';
import { Search, MapPin } from 'lucide-react';
import MqttStatus from './MqttStatus';
import Esp32Signals from './Esp32Signals';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-300 transition-all hover:text-white"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Bulawayo, Zimbabwe</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-slate-500">Digital Dispatch Command Center</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search drivers, trips, locations..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
            />
          </div>
        </div>

        {/* Right: Status + Notifications + User */}
        <div className="flex items-center gap-3">
          <Esp32Signals />
          <MqttStatus />
          
          <button className="relative p-2 rounded-xl hover:bg-slate-700/50 text-slate-300 transition-all hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="hidden md:block text-sm">
              <p className="text-slate-200 font-medium">Admin</p>
              <p className="text-slate-500 text-xs">Fleet Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

