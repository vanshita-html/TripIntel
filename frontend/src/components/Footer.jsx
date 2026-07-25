import React from 'react';
import { Shield, Database, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-16 px-6 sm:px-10 lg:px-16 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-lg shadow-lg">T</span>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">TripIntel</span>
          </div>
          <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed">
            Tourism Business Intelligence and Analytics. Transforming geospatial metrics into actionable hospitality decisions.
          </p>
        </div>

        {/* Platform details */}
        <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-500 items-center">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            <Database className="w-4 h-4 text-primary" />
            <span>SQLite Database Engine</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Scikit-Learn ML Models</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            <Shield className="w-4 h-4 text-accent" />
            <span>Local JWT Protection</span>
          </div>
        </div>

        {/* Copy */}
        <div className="text-xs text-slate-600 font-bold tracking-wider self-start md:self-auto">
          © {new Date().getFullYear()} TRIPINTEL CO. ALL RIGHTS RESERVED.
        </div>

      </div>
    </footer>
  );
}
