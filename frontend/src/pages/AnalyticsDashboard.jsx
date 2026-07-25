import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Download, FileText, Filter, Calendar, MapPin, Sparkles, TrendingUp, Users, DollarSign, Clock, Thermometer, CloudRain, Star, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filters State
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedTouristType, setSelectedTouristType] = useState('');

  // Lists
  const statesList = ["Goa", "Kerala", "Rajasthan", "Ladakh (UT)", "Jammu and Kashmir", "Uttarakhand", "Himachal Pradesh", "Andaman and Nicobar Islands"];
  const citiesList = ["Goa", "Kerala", "Jaipur", "Ladakh", "Kashmir", "Rishikesh", "Manali", "Shimla", "Udaipur", "Andaman Islands"];
  const monthsList = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];
  const touristTypesList = ["Leisure", "Business", "Spiritual"];
  const yearsList = ["2021", "2022", "2023", "2024", "2025"];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedState, selectedCity, selectedMonth, selectedYear, selectedTouristType]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let query = `http://localhost:8000/api/analytics/dashboard?`;
      if (selectedState) query += `state=${selectedState}&`;
      if (selectedCity) query += `city=${selectedCity}&`;
      if (selectedMonth) query += `month=${selectedMonth}&`;
      if (selectedYear) query += `year=${selectedYear}&`;
      if (selectedTouristType) query += `tourist_type=${selectedTouristType}&`;

      const res = await axios.get(query);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedMonth('');
    setSelectedYear('2025');
    setSelectedTouristType('');
  };

  const handleExportCSV = () => {
    if (!data) return;
    const kpis = data.kpis;
    let csvContent = "data:text/csv;charset=utf-8,Metric,Value\n";
    csvContent += `Total Tourist Arrivals,${kpis.total_arrivals}\n`;
    csvContent += `Total Economic Revenue ($M),${kpis.total_revenue_millions}\n`;
    csvContent += `Average 5-Day Budget ($),${kpis.average_budget_5_days}\n`;
    csvContent += `Average Hotel Occupancy (%),${kpis.hotel_occupancy_pct}\n`;
    csvContent += `Tourism Growth Rate (YoY %),${kpis.growth_rate_pct}\n`;
    csvContent += `Average Customer Satisfaction (%),${kpis.customer_satisfaction_pct}\n`;
    csvContent += `Trending Destination,${kpis.trending_destination}\n`;
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `TripIntel_BI_Report_${selectedYear || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#10B981', '#14B8A6', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Map generated insights into structured Insight -> Reason -> Suggested Action cards
  const getStructuredInsight = (insightText) => {
    if (insightText.includes("increased") || insightText.includes("growth")) {
      return {
        insight: "Strong Growth Recorded",
        reason: insightText,
        action: "Focus marketing on high-volume hubs and optimize airline scheduling."
      };
    }
    if (insightText.includes("rainfall") || insightText.includes("monsoon")) {
      return {
        insight: "Monsoon Climatic Dampener",
        reason: insightText,
        action: "Implement hotel discounts and launch promotional indoor attraction events."
      };
    }
    if (insightText.includes("revenue")) {
      return {
        insight: "Peak Revenue Generator",
        reason: insightText,
        action: "Enhance local shopping centers and implement premium activity tickets."
      };
    }
    return {
      insight: "Tourism Volume Insight",
      reason: insightText,
      action: "Review hospitality staffing and optimize local transit capacities."
    };
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm font-extrabold text-slate-500">Loading Business Intelligence Suite...</p>
      </div>
    );
  }

  const kpis = data.kpis;
  const charts = data.charts;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-2">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
          <div>
            <h1 className="text-section font-display font-black text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="text-primary w-8 h-8" />
              Tourism Business Intelligence Portal
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">SaaS dashboard providing granular analytics and forecast trends.</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Download className="w-4.5 h-4.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:brightness-105 rounded-xl text-xs font-extrabold shadow-lg shadow-primary/10 transition-all cursor-pointer"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>Print PDF Report</span>
            </button>
          </div>
        </div>

        {/* 1. HORIZONTAL FILTER STICKY TOOLBAR */}
        <div className="sticky top-4 z-40 bg-white/90 backdrop-blur-lg border border-slate-200/60 rounded-2xl p-4 shadow-md mb-10 print:hidden flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4.5 h-4.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider">Filters</span>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row gap-3.5 flex-grow justify-end max-w-5xl">
            
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
              className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-10 min-w-[120px]"
            >
              <option value="">All States</option>
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-10 min-w-[120px]"
            >
              <option value="">All Cities</option>
              {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-10 min-w-[100px]"
            >
              <option value="">All Months</option>
              {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-10 min-w-[90px]"
            >
              <option value="">All Years</option>
              {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={selectedTouristType}
              onChange={(e) => setSelectedTouristType(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-10 min-w-[110px]"
            >
              <option value="">All Segmentations</option>
              {touristTypesList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

          </div>

          <button
            onClick={handleClearFilters}
            className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest pl-2 border-l border-slate-100"
          >
            Clear
          </button>
        </div>

        {/* 2. DYNAMIC AI ASSISTANT INSIGHTS CARD - Slate background with left accent border */}
        {data.insights && data.insights.length > 0 && (
          <div className="bg-slate-900 border-l-4 border-emerald-400 rounded-3xl p-8 shadow-xl mb-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 fill-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-display">AI Assistant Dashboard Summaries</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Dynamic Natural Language Storytelling</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {data.insights.map((insight, idx) => {
                const s = getStructuredInsight(insight);
                return (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 hover:border-slate-700/70 transition-all flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{s.insight}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-2.5 font-semibold leading-relaxed">
                        "{s.reason}"
                      </p>
                    </div>
                    <div className="mt-5 pt-3.5 border-t border-slate-700/30 text-[11px] font-medium text-slate-400 leading-normal">
                      <span className="text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider block mb-1">Recommended Action</span>
                      {s.action}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. KPI CARDS GRID - rounded-3xl and hover highlights */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
          
          {[
            { label: "Total Arrivals", val: kpis.total_arrivals.toLocaleString(), desc: `Year ${selectedYear || 'All'} Count`, icon: Users, color: "text-primary" },
            { label: "Economic Revenue", val: `$${kpis.total_revenue_millions.toLocaleString()}M`, desc: "Local Hospitality GDP", icon: DollarSign, color: "text-secondary" },
            { label: "Avg 5-Day Budget", val: `$${kpis.average_budget_5_days.toLocaleString()}`, desc: "Moderate Tier / 2 Pax", icon: Clock, color: "text-accent" },
            { label: "Hotel Occupancy", val: `${kpis.hotel_occupancy_pct}%`, desc: `Density: ${kpis.crowd_level}`, icon: Star, color: "text-primary" },
            { label: "Climatic Average", val: `${kpis.avg_temp}°C`, desc: `Rainfall: ${kpis.avg_rain_mm || kpis.avg_rainfall_mm}mm`, icon: Thermometer, color: "text-secondary" }
          ].map((k, idx) => {
            const Icon = k.icon;
            return (
              <motion.div
                whileHover={{ y: -3 }}
                key={idx}
                className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:border-emerald-400/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">{k.label}</span>
                  <Icon className={`w-5 h-5 ${k.color}`} />
                </div>
                <div className="mt-5">
                  <div className="text-2xl font-black text-slate-800 tracking-tight leading-none">{k.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-2">{k.desc}</div>
                </div>
              </motion.div>
            );
          })}

        </div>

        {/* Secondary KPI details block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Trending Destination", val: kpis.trending_destination },
            { label: "Most Visited State", val: kpis.most_visited_state },
            { label: "YoY Growth Rate", val: `+${kpis.growth_rate_pct}%` },
            { label: "Customer Satisfaction", val: `${kpis.customer_satisfaction_pct}%` }
          ].map((k, idx) => (
            <div key={idx} className="bg-slate-100 border border-slate-200/20 rounded-2xl p-5 text-center shadow-inner">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
              <div className="text-sm font-extrabold text-slate-800 mt-1">{k.val}</div>
            </div>
          ))}
        </div>

        {/* 4. VISUALIZATION CHARTS GRID - margins set on axes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:grid-cols-1">
          
          {/* Chart 1: Monthly Arrivals */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Monthly Tourist Arrivals</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly_arrivals} margin={{ left: 15, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" tickFormatter={(m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [value.toLocaleString(), 'Arrivals']}
                  />
                  <Bar dataKey="arrivals" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Hotel Occupancy */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Hotel Occupancy Trends (%)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.hotel_occupancy} margin={{ left: 15, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" tickFormatter={(m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} />
                  <YAxis stroke="#94A3B8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [`${value}%`, 'Occupancy']}
                  />
                  <Line type="monotone" dataKey="occupancy" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Visitor Mix */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Domestic vs International Visitor Ratio</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.visitor_mix}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.visitor_mix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Visitors']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Economic Revenue */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Economic Sector Contributions ($ Millions)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenue_split} layout="vertical" margin={{ left: 25, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="category" type="category" stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [`$${value}M`, 'Contribution']}
                  />
                  <Bar dataKey="revenue" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Weather Impact Scatter Plot */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Climatic Impact analysis (Temp vs Arrivals)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 25 }}>
                  <CartesianGrid stroke="#F1F5F9" />
                  <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" stroke="#94A3B8" />
                  <YAxis type="number" dataKey="arrivals" name="Arrivals" stroke="#94A3B8" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value.toLocaleString(), name]} />
                  <Scatter name="Climatic impact" data={charts.weather_impact} fill="#10B981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Seasonal Comparison */}
          <div className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Seasonal Tourist Density comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.seasonal_comparison} margin={{ left: 15, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="season" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [value.toLocaleString(), 'Arrivals']}
                  />
                  <Bar dataKey="arrivals" fill="#14B8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
