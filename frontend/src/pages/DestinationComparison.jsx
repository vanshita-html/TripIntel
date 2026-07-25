import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layers, Thermometer, CloudRain, Users, DollarSign, Clock, Star, ArrowRight } from 'lucide-react';

export default function DestinationComparison() {
  const [destList, setDestList] = useState([]);
  const [d1Id, setD1Id] = useState('');
  const [d2Id, setD2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/destinations')
      .then(res => {
        setDestList(res.data);
        if (res.data.length >= 2) {
          setD1Id(res.data[0].id);
          setD2Id(res.data[1].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (d1Id && d2Id) {
      fetchComparison();
    }
  }, [d1Id, d2Id]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/destinations/compare/pair?id1=${d1Id}&id2=${d2Id}`);
      setComparison(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const d1 = comparison?.destination1;
  const d2 = comparison?.destination2;

  const compareRows = [
    { label: "State UT", key: "state", icon: null },
    { label: "Traveler Rating", key: "rating", icon: Star, suffix: " ★" },
    { label: "Avg 5-Day Budget", key: "avg_budget_5_days_2_pax", icon: Clock, prefix: "$" },
    { label: "Hotel Occupancy", key: "hotel_occupancy", icon: Star, suffix: "%" },
    { label: "Yearly Revenue", key: "yearly_revenue_millions", icon: DollarSign, prefix: "$", suffix: "M" },
    { label: "Historical Arrivals", key: "total_historical_arrivals", icon: Users, formatter: (val) => val.toLocaleString() },
    { label: "Average Temp", key: "avg_temp", icon: Thermometer, suffix: " °C" },
    { label: "Average Rainfall", key: "avg_rainfall_mm", icon: CloudRain, suffix: " mm" },
    { label: "Recommended Months", key: "best_months", icon: null },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Header */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-8 flex items-center gap-3">
          <Layers className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-display font-black text-slate-800">Destination Comparison Dashboard</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Evaluate and compare locations side-by-side on climate, costs, and occupancies.</p>
          </div>
        </div>

        {/* Dropdowns selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5.5 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Compare Target A</label>
            <select
              value={d1Id}
              onChange={(e) => setD1Id(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
            >
              {destList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.state})</option>)}
            </select>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5.5 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Compare Target B</label>
            <select
              value={d2Id}
              onChange={(e) => setD2Id(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
            >
              {destList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.state})</option>)}
            </select>
          </div>

        </div>

        {/* Result grid layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm font-semibold text-slate-500">Compiling analytics comparison...</p>
          </div>
        ) : d1 && d2 ? (
          <div className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-md">
            
            {/* Header banners */}
            <div className="grid grid-cols-2 border-b border-slate-100">
              <div className="relative h-56 border-r border-slate-100">
                <img src={d1.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center p-4">
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-white text-center tracking-tight leading-tight">{d1.name}</h2>
                </div>
              </div>
              <div className="relative h-56">
                <img src={d2.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center p-4">
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-white text-center tracking-tight leading-tight">{d2.name}</h2>
                </div>
              </div>
            </div>

            {/* Metrics List rows */}
            <div className="divide-y divide-slate-100">
              {compareRows.map((row, idx) => {
                const Icon = row.icon;
                const v1 = d1[row.key];
                const v2 = d2[row.key];
                
                let isD1Better = false;
                let isD2Better = false;
                if (typeof v1 === 'number' && typeof v2 === 'number') {
                  if (row.key === 'avg_budget_5_days_2_pax') {
                    isD1Better = v1 < v2;
                    isD2Better = v2 < v1;
                  } else {
                    isD1Better = v1 > v2;
                    isD2Better = v2 > v1;
                  }
                }

                const formatValue = (val) => {
                  if (row.formatter) return row.formatter(val);
                  return `${row.prefix || ''}${val}${row.suffix || ''}`;
                };

                return (
                  <div key={idx} className="grid grid-cols-3 py-5 px-8 items-center hover:bg-slate-50/50 transition-colors">
                    
                    <div className="text-left">
                      <span className={`text-sm tracking-wide ${isD1Better ? 'font-extrabold text-primary-dark' : 'font-semibold text-slate-700'}`}>
                        {formatValue(v1)}
                      </span>
                    </div>

                    <div className="text-center flex flex-col items-center justify-center">
                      {Icon && <Icon className="w-4 h-4 text-slate-400 mb-1" />}
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{row.label}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm tracking-wide ${isD2Better ? 'font-extrabold text-primary-dark' : 'font-semibold text-slate-700'}`}>
                        {formatValue(v2)}
                      </span>
                    </div>

                  </div>
                );
              })}

              {/* Attractions row */}
              <div className="grid grid-cols-3 py-6.5 px-8 items-start">
                <div className="text-left space-y-1.5">
                  {d1.attractions.map((a, idx) => (
                    <div key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center flex flex-col items-center justify-center pt-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attractions</span>
                </div>
                <div className="text-right space-y-1.5 flex flex-col items-end">
                  {d2.attractions.map((a, idx) => (
                    <div key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
