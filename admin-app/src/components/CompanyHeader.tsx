import React from 'react';

interface CompanyHeaderProps {
  collapsed?: boolean;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ collapsed }) => {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-4 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">D</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-white truncate">Digital Dispatch</h1>
          <p className="text-xs text-slate-400 truncate">Bulawayo, Zimbabwe</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs text-emerald-400 font-medium">Operations Active</span>
      </div>
    </div>
  );
};

export default CompanyHeader;

