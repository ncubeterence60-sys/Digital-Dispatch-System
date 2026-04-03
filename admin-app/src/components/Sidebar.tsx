import React from 'react'
import { LayoutDashboard, FileText, DollarSign, Users } from 'lucide-react'

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Admin Panel
        </h1>
        <p className="text-slate-400 text-sm mt-1">Digital Dispatch</p>
      </div>
      
      <nav className="p-6 space-y-2">
        <a href="/" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
          <LayoutDashboard className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Reports</span>
        </a>
        <a href="/trips" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
          <FileText className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Trip Lists</span>
        </a>
        <a href="/earnings" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
          <DollarSign className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Earnings</span>
        </a>
        <a href="/drivers" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800 transition-colors bg-slate-800">
          <Users className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-slate-200">Drivers</span>
        </a>
      </nav>
    </div>
  )
}

export default Sidebar

