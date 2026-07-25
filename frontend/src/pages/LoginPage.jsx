import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, User, ShieldCheck, LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Tourist');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post('http://localhost:8000/api/auth/register', {
          email,
          password,
          full_name: fullName,
          role
        });
        
        const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
          username: email,
          password
        });
        
        localStorage.setItem('token', loginRes.data.access_token);
        localStorage.setItem('role', loginRes.data.role);
        localStorage.setItem('name', loginRes.data.full_name);
        navigate('/dashboard');
      } else {
        const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
          username: email,
          password
        });
        
        localStorage.setItem('token', loginRes.data.access_token);
        localStorage.setItem('role', loginRes.data.role);
        localStorage.setItem('name', loginRes.data.full_name);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Authentication failed. Check details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-6 sm:px-10 lg:px-16 font-sans relative overflow-hidden">
      
      {/* Background visual indicators */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 bg-slate-900/80 backdrop-blur border border-slate-800/80 p-10 rounded-[32px] shadow-2xl relative z-10">
        
        <div className="text-center">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto mb-5">T</span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight">
            {isRegister ? 'Register Platform Desk' : 'Sign in to TripIntel'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            Access tourism business intelligence metrics.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {isRegister && (
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-950/50 text-white focus:outline-none focus:ring-4 focus:ring-primary/15 text-sm focus:border-primary placeholder-slate-600 font-bold"
                />
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="analyst@tripintel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-950/50 text-white focus:outline-none focus:ring-4 focus:ring-primary/15 text-sm focus:border-primary placeholder-slate-600 font-bold"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-950/50 text-white focus:outline-none focus:ring-4 focus:ring-primary/15 text-sm focus:border-primary placeholder-slate-600 font-bold"
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>

          {isRegister && (
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-950/50 text-white focus:outline-none focus:ring-4 focus:ring-primary/15 text-xs font-bold focus:border-primary text-slate-400 h-12"
                >
                  <option value="Tourist">Tourist (General Analyst)</option>
                  <option value="Business Analyst">Business Analyst (Commercial)</option>
                  <option value="Tourism Administrator">Tourism Administrator (Government)</option>
                </select>
                <ShieldCheck className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-tr from-primary to-secondary hover:brightness-105 hover:shadow-lg hover:shadow-primary/10 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : isRegister ? 'Register Desk' : 'Sign In'}
          </button>

        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs font-extrabold text-primary-light hover:text-primary transition-colors uppercase tracking-widest"
          >
            {isRegister ? 'Use existing desk? Sign In' : 'Create new desk'}
          </button>
        </div>

      </div>
    </div>
  );
}
