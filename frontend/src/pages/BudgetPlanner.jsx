import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Sparkles, DollarSign, Hotel, Utensils, Navigation, Plane, Ticket, ShoppingBag, ShieldAlert, Thermometer, CloudRain } from 'lucide-react';

export default function BudgetPlanner() {
  const [destList, setDestList] = useState([]);
  const [destId, setDestId] = useState('');
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [tier, setTier] = useState('Moderate');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/destinations')
      .then(res => {
        setDestList(res.data);
        if (res.data.length > 0) {
          setDestId(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleEstimate = async (e) => {
    if (e) e.preventDefault();
    if (!destId) return;

    setLoading(true);
    try {
      const budgetRes = await axios.post('http://localhost:8000/api/budget/estimate', {
        destination_id: parseInt(destId),
        days: parseInt(days),
        travelers: parseInt(travelers),
        tier: tier
      });
      setResult(budgetRes.data);

      const destRes = await axios.get(`http://localhost:8000/api/destinations/${destId}`);
      const octWeather = destRes.data.weather.find(w => w.month === 10) || destRes.data.weather[0];
      setWeatherInfo(octWeather);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destId) {
      handleEstimate();
    }
  }, [destId]);

  const COLORS = ['#10B981', '#14B8A6', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'];

  const categoryIcons = {
    hotel: Hotel,
    food: Utensils,
    local_transport: Navigation,
    flights: Plane,
    activities: Ticket,
    shopping: ShoppingBag,
    misc: ShieldAlert
  };

  const getPieData = () => {
    if (!result) return [];
    const b = result.daily_expense_breakdown;
    return [
      { name: 'Hotel Accommodations', value: b.hotel },
      { name: 'Food & Beverage', value: b.food },
      { name: 'Local Transit', value: b.local_transport },
      { name: 'Flights/Intercity', value: b.flights },
      { name: 'Sightseeing/Activities', value: b.activities },
      { name: 'Shopping', value: b.shopping },
      { name: 'Miscellaneous', value: b.misc }
    ].filter(i => i.value > 0);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Header */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-8 flex items-center gap-3">
          <Calculator className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-display font-black text-slate-800">Travel Budget Cost Planner</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Forecast category-specific travel expenses using local ML regressions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form parameters */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm h-fit">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-50 pb-2">Trip Specifications</h3>
            
            <form onSubmit={handleEstimate} className="space-y-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Destination</label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
                >
                  {destList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.state})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration (Days)</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Comfort Category</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['Budget', 'Moderate', 'Luxury'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-2.5 border rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        tier === t
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-tr from-primary to-secondary hover:brightness-105 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all flex justify-center items-center gap-1.5 cursor-pointer mt-2"
              >
                {loading ? 'Estimating...' : 'Generate Cost Projections'}
              </button>

            </form>
          </div>

          {/* Results layout */}
          <div className="lg:col-span-2 space-y-6">
            {result && (
              <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-sm">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimated Budget</span>
                    <div className="text-4xl font-display font-black text-slate-800 mt-1 flex items-center tracking-tight">
                      <DollarSign className="w-8 h-8 text-primary" />
                      {result.total_estimated_budget.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-800 ml-1 font-extrabold">{result.days} Days</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                      <span className="text-slate-400">Travelers:</span>
                      <span className="text-slate-800 ml-1 font-extrabold">{result.travelers} Pax</span>
                    </div>
                    <div className="bg-primary/10 rounded-xl px-4 py-2 text-primary-dark font-extrabold border border-primary/10">
                      <span>Tier: {result.tier}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Cards list breakdown */}
                  <div className="space-y-2.5">
                    {Object.entries(result.daily_expense_breakdown).map(([cat, val], idx) => {
                      if (val <= 0) return null;
                      const Icon = categoryIcons[cat] || DollarSign;
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-2xl hover:bg-slate-50/50 hover:border-slate-200 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 capitalize">{cat.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">${val.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart pie */}
                  <div className="h-64 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Per Traveler</span>
                      <span className="text-sm font-black text-slate-850 mt-0.5">${Math.round(result.total_estimated_budget / result.travelers).toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Weather optimizations */}
                {weatherInfo && (
                  <div className="bg-gradient-to-tr from-accent/10 via-amber-500/5 to-transparent border border-accent/20 rounded-2xl p-5 mt-8 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent-dark flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Weather pricing analytics advice</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-bold mt-1.5">
                        October average rainfall is {weatherInfo.rainfall}mm. Planning trips during transitional climate weeks yields up to 20% savings on hotels.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
