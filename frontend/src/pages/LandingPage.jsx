import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, BarChart2, MapPin, Calculator, HelpCircle, Layers, ArrowRight, TrendingUp, Users, DollarSign, Star, Sparkles, Thermometer } from 'lucide-react';
import axios from 'axios';

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_arrivals: '850K+',
    revenue: '$450M+',
    avg_rating: '4.7/5',
    growth_rate: '+18.4%'
  });

  const [featuredDests, setFeaturedDests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch dashboard stats from API
    axios.get('http://localhost:8000/api/analytics/dashboard')
      .then(res => {
        const k = res.data.kpis;
        setStats({
          total_arrivals: `${(k.total_arrivals / 1000).toFixed(0)}K+`,
          revenue: `$${k.total_revenue_millions.toFixed(0)}M`,
          avg_rating: `${k.average_rating}/5`,
          growth_rate: `+${k.growth_rate_pct}%`
        });
      })
      .catch(err => console.error("Error loading landing page analytics", err));

    // Fetch destinations
    axios.get('http://localhost:8000/api/destinations')
      .then(res => {
        setFeaturedDests(res.data.slice(0, 3)); // show first 3
      })
      .catch(err => console.error(err));
  }, []);

  // Handle Autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await axios.get(`http://localhost:8000/api/search?q=${searchQuery}`);
          setAutocompleteResults(res.data.filter(i => i.type === 'destination'));
          setShowDropdown(true);
        } catch (err) {
          console.error("Search error", err);
        }
      } else {
        setAutocompleteResults([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/explore?search=${searchQuery}`);
    }
  };

  const services = [
    { title: "Business Intelligence", desc: "Granular dashboard tracking visitor segments and monthly growth cycles.", icon: BarChart2, path: "/dashboard", color: "from-emerald-400 to-teal-500" },
    { title: "Predictive Forecasts", desc: "Machine Learning models predicting tourist volumes, occupancy rates, and budgets.", icon: Sparkles, path: "/dashboard", color: "from-blue-400 to-indigo-500" },
    { title: "Interactive GeoMaps", desc: "OpenStreetMap nodes clustering local attractions, accommodations, and transit hubs.", icon: MapPin, path: "/map", color: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">

      {/* 1. HERO SECTION - Dark Theme with high contrast */}
      <section className="relative overflow-hidden pt-28 pb-36 bg-slate-950 text-white">

        {/* Glowing visual indicators */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2.5 bg-slate-900 border border-slate-800 rounded-full px-5 py-2 mb-10 shadow-lg hover:border-slate-700 transition-colors"
          >
            <Sparkles className="w-4.5 h-4.5 text-accent" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-200">New: ML predictive models online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-hero mb-8 max-w-4xl mx-auto"
          >

            <span className="block bg-gradient-to-r from-primary-light via-secondary-light to-accent bg-clip-text text-transparent mt-2">
              Transforming Tourism Data Into
              Intelligent Travel Decisions.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-semibold"
          >
            TripIntel is a premium Business Intelligence and predictive analytics platform built for tourism boards, hospitality groups, and planners.
          </motion.p>

          {/* Elevated Floating Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-lg mx-auto relative mb-20"
          >
            <div className="relative flex items-center bg-white border border-slate-200 shadow-2xl rounded-3xl p-2.5">
              <input
                type="text"
                placeholder="Enter destination name (e.g. Goa, Ladakh)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-3 bg-transparent text-slate-800 focus:outline-none placeholder-slate-400 font-bold text-sm"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary hover:brightness-105 flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all duration-300 flex-shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && autocompleteResults.length > 0 && (
              <div className="absolute top-20 left-0 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 text-left p-3 border border-slate-100">
                {autocompleteResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                      navigate(`/explore?id=${item.id}`);
                    }}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-slate-50 rounded-2xl transition-all duration-200"
                  >
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-extrabold text-slate-800 leading-tight">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.form>

        </div>
      </section>

      {/* 2. KPI STATS STRIP - Floating glass panel overlaps hero */}
      <section className="-mt-16 relative z-20 max-w-5xl mx-auto w-full px-6">
        <div className="bg-white border border-slate-100/80 rounded-[32px] p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-2xl relative">

          <div className="flex flex-col items-center justify-center border-r border-slate-100 last:border-0 md:border-r">
            <Users className="w-6 h-6 text-primary mb-2.5" />
            <span className="text-3xl font-display font-black text-slate-800 tracking-tight">{stats.total_arrivals}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Tourist Arrivals</span>
          </div>

          <div className="flex flex-col items-center justify-center border-r border-slate-100 last:border-0 md:border-r">
            <DollarSign className="w-6 h-6 text-secondary mb-2.5" />
            <span className="text-3xl font-display font-black text-slate-800 tracking-tight">{stats.revenue}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Economic revenue</span>
          </div>

          <div className="flex flex-col items-center justify-center border-r border-slate-100 last:border-0 md:border-r">
            <Star className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-3xl font-display font-black text-slate-800 tracking-tight">{stats.avg_rating}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Average rating</span>
          </div>

          <div className="flex flex-col items-center justify-center last:border-0">
            <TrendingUp className="w-6 h-6 text-primary mb-2.5" />
            <span className="text-3xl font-display font-black text-slate-800 tracking-tight">{stats.growth_rate}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">YoY growth</span>
          </div>

        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS SECTION - Light gray background */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="text-section font-display font-black text-slate-800">Featured Destination Profiles</h2>
              <p className="text-slate-500 mt-2.5 max-w-md font-semibold text-sm">Airbnb-style details encouraging data exploration.</p>
            </div>
            <Link
              to="/explore"
              className="flex items-center space-x-1 text-primary-dark font-extrabold hover:text-primary transition-colors text-xs uppercase tracking-wider mt-4 md:mt-0"
            >
              <span>Explore All Spots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDests.map((dest, idx) => (
              <motion.div
                whileHover={{ y: -6 }}
                key={idx}
                className="bg-white border border-slate-100/80 rounded-[28px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/explore?id=${dest.id}`)}
              >
                {/* Visual Image container with badges overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/75 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-extrabold text-white tracking-widest uppercase">
                    {dest.state}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl shadow-sm text-xs font-black text-slate-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="p-6.5">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-card font-display font-extrabold text-slate-800 group-hover:text-primary transition-colors leading-tight">
                      {dest.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold mb-5.5">
                    {dest.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-secondary-dark" />
                      <span>Mild Climate</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <DollarSign className="w-4 h-4 text-accent-dark" />
                      <span>Moderate Budget</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VALUE PROPOSITION SERVICES - Pure White background */}
      <section className="py-28 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 className="text-section font-display font-black text-slate-800 mb-4">Professional Platform Capabilities</h2>
          <p className="text-slate-500 mt-2 mb-16 max-w-md mx-auto font-semibold text-sm">Advanced BI toolsets designed to analyze tourism metrics.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(svc.path)}
                  className="bg-slate-50/50 border border-slate-100 rounded-[28px] p-8 text-left hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${svc.color} flex items-center justify-center text-white mb-6 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-800 mb-2.5 group-hover:text-primary transition-colors">{svc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{svc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SIDE-BY-SIDE COMPARISON CTA - Deep slate dark section */}
      <section className="bg-slate-950 text-white py-24 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-section text-white font-display font-black tracking-tight mb-6">
            Compare Tourism Locations Side-by-Side
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed font-semibold">
            Evaluate cost variations, weather differentials, hotel occupancies, and visitor flows. Ideal for commercial planning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4.5">
            <Link
              to="/compare"
              className="px-8 py-3.5 bg-gradient-to-tr from-primary to-secondary text-white font-extrabold rounded-2xl shadow-lg hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Compare Destinations
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold rounded-2xl transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
