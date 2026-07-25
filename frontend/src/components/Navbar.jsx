import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Compass, BarChart2, MapPin, Calculator, HelpCircle, Layers, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const searchContainerRef = useRef(null);

  // Load auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    if (token && token !== 'null' && token !== 'undefined') {
      setUserData({ 
        token, 
        role: (role && role !== 'null' && role !== 'undefined') ? role : 'Tourist', 
        name: (name && name !== 'null' && name !== 'undefined') ? name : 'User' 
      });
    } else {
      setUserData(null);
    }
  }, [location]);

  // Handle Search Input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await axios.get(`http://localhost:8000/api/search?q=${searchQuery}`);
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error("Autocomplete search error", err);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setUserData(null);
    navigate('/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Analytics', icon: BarChart2 },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/map', label: 'Tourism Map', icon: MapPin },
    { path: '/compare', label: 'Compare', icon: Layers },
    { path: '/budget', label: 'Budget Planner', icon: Calculator },
    { path: '/advisor', label: 'AI Advisor', icon: HelpCircle },
  ];

  const handleSearchResultClick = (item) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (item.type === 'destination') {
      navigate(`/explore?id=${item.id}`);
    } else {
      navigate(`/explore?id=${item.destination_id || item.id}`);
    }
  };

  return (
    <nav className="sticky top-0 z-[1000] bg-white/85 backdrop-blur-lg border-b border-slate-100/80 shadow-sm px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex justify-between h-20 items-center">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              T
            </span>
            <span className="font-display font-extrabold text-2xl bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
              TripIntel
            </span>
          </Link>
        </div>

        {/* Navigation Links - Desktop Centered */}
        <div className="hidden lg:flex items-center space-x-1 mx-6 flex-grow justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Search bar & User Account Pill */}
        <div className="flex items-center space-x-4">
          
          {/* Search bar */}
          <div ref={searchContainerRef} className="hidden md:block relative w-64 lg:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search spots, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold transition-all duration-300 placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
            </div>

            {/* Dropdown Suggestions */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-14 right-0 w-80 bg-white border border-slate-100 rounded-3xl shadow-xl z-[1001] max-h-96 overflow-y-auto p-2.5 scrollbar border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 px-3 py-1.5 uppercase tracking-wider">Search Results</div>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(item)}
                    className="w-full text-left flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-all duration-200"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary-dark font-bold">T</div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-sm font-extrabold text-slate-800 truncate leading-snug">{item.title}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</div>
                      <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md inline-block mt-1 tracking-wider">{item.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center">
            {userData ? (
              <div className="flex items-center space-x-3.5">
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-800">{userData.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary px-2.5 py-0.5 bg-primary/10 rounded-lg ml-1">
                    {(userData.role || 'Tourist').replace("Tourism ", "")}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-extrabold text-slate-500 hover:text-slate-800 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-gradient-to-tr from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 text-white font-extrabold rounded-2xl text-xs transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white shadow-xl py-2 px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-base font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              >
                <Icon className="w-5 h-5 text-primary" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile Auth */}
          <div className="pt-4 border-t border-slate-100 mt-2">
            {userData ? (
              <div className="flex flex-col gap-2.5 p-2">
                <div className="text-sm font-extrabold text-slate-800">Account: {userData.name}</div>
                <div className="text-xs font-bold text-slate-400">Role: {userData.role || 'Tourist'}</div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-tr from-primary to-secondary text-white font-bold rounded-2xl text-sm shadow"
              >
                <LogIn className="w-4.5 h-4.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
