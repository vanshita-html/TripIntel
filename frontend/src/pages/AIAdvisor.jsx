import React, { useState } from 'react';
import axios from 'axios';
import { HelpCircle, Sparkles, DollarSign, Calendar, Heart, Shield, Award, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIAdvisor() {
  const navigate = useNavigate();
  
  // Inputs
  const [budgetLimit, setBudgetLimit] = useState(1500);
  const [days, setDays] = useState(6);
  const [preferredWeather, setPreferredWeather] = useState('Any');
  const [composition, setComposition] = useState('Solo');
  const [selectedCats, setSelectedCats] = useState(['beaches']);
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const categoriesList = [
    { value: 'beaches', label: 'Beaches & Coastal' },
    { value: 'mountains', label: 'Mountain & Snowy' },
    { value: 'nature', label: 'Nature & Safaris' },
    { value: 'adventure', label: 'Adventure Sports' },
    { value: 'spiritual', label: 'Yoga & Spiritual' },
    { value: 'luxury', label: 'Premium Luxury' },
    { value: 'shopping', label: 'Markets & Shopping' }
  ];

  const handleToggleCat = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleAdvise = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/recommendations', {
        budget_limit: parseFloat(budgetLimit),
        days: parseInt(days),
        preferred_weather: preferredWeather,
        categories: [...selectedCats, composition]
      });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Header */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-8 flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-display font-black text-slate-800">AI Travel recommendation Advisor</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Get customized travel Suggestions using climate matching, budget controls, and style tags.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form preferences */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm h-fit">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-50 pb-2">Travel Preferences</h3>
            <form onSubmit={handleAdvise} className="space-y-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Budget limit ($)</label>
                <input
                  type="number"
                  min="200"
                  max="10000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trip Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Climate Preference</label>
                <select
                  value={preferredWeather}
                  onChange={(e) => setPreferredWeather(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
                >
                  <option value="Any">Any Climate</option>
                  <option value="Cold">Crisp Snowy Cold (Himalayan)</option>
                  <option value="Warm">Sunny Warm (Coastal & South)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Travel Group</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['Solo', 'Family', 'Honeymoon', 'Friends'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setComposition(c)}
                      className={`py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        composition === c
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Style & Interests</label>
                <div className="space-y-2.5 mt-1">
                  {categoriesList.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.value)}
                        onChange={() => handleToggleCat(cat.value)}
                        className="rounded text-primary focus:ring-primary w-4.5 h-4.5 border-slate-200"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-tr from-primary to-secondary hover:brightness-105 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all flex justify-center items-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Consulting Advisor...' : 'Fetch Recommendations'}
              </button>

            </form>
          </div>

          {/* Recommendations cards */}
          <div className="lg:col-span-2 space-y-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200/60 rounded-[28px] shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-sm font-semibold text-slate-500">AI finding matching targets...</p>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/explore?id=${rec.destination_id}`)}
                  className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md hover:border-emerald-400/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="space-y-3.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-extrabold text-slate-800 font-display group-hover:text-primary transition-colors leading-tight">
                        {rec.name}
                      </h3>
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                        {rec.state}
                      </span>
                      <div className="bg-primary/10 text-primary-dark font-black text-[10px] px-3 py-1 rounded-full border border-primary/5">
                        {rec.match_score}% Match
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {rec.reason}
                    </p>

                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 pt-1.5 border-t border-slate-50">
                      <span>Visiting months:</span>
                      <span className="text-slate-600 font-extrabold bg-slate-100 px-2 py-0.5 rounded-md">{rec.best_months}</span>
                    </div>

                  </div>

                  <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4.5 md:pt-0">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Est Budget</span>
                      <div className="text-xl font-black text-slate-800 mt-1">${rec.estimated_cost.toLocaleString()}</div>
                    </div>
                    
                    <button className="mt-0 md:mt-3.5 flex items-center gap-1 text-xs font-black text-primary hover:text-primary-dark tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/60 rounded-[28px] shadow-sm text-center">
                <HelpCircle className="w-12 h-12 text-slate-350 mb-3" />
                <p className="text-sm font-semibold text-slate-500 max-w-sm">Enter your preferred budget limit, days, and travel composition to find custom recommendations.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
