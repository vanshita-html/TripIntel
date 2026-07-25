import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Compass, Sparkles, MapPin, Calculator, Thermometer, CloudRain, Star, Plane, Train, Bus, Car } from 'lucide-react';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// DivIcon overrides for POIs
const attractionIcon = L.divIcon({
  className: 'custom-icon-attraction',
  html: `<div style="background-color: #10B981; width: 15px; height: 15px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25);"></div>`,
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

const hotelIcon = L.divIcon({
  className: 'custom-icon-hotel',
  html: `<div style="background-color: #F59E0B; width: 15px; height: 15px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25);"></div>`,
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

export default function DestinationExplorer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const destinationIdParam = searchParams.get('id');

  const [destinations, setDestinations] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const [showAttractions, setShowAttractions] = useState(true);
  const [showHotels, setShowHotels] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/destinations')
      .then(res => {
        setDestinations(res.data);
        if (destinationIdParam) {
          setSelectedDestId(parseInt(destinationIdParam));
        } else if (res.data.length > 0) {
          setSelectedDestId(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [destinationIdParam]);

  useEffect(() => {
    if (selectedDestId) {
      fetchDestinationDetails(selectedDestId);
      fetchArrivalForecasts(selectedDestId);
    }
  }, [selectedDestId]);

  const fetchDestinationDetails = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/destinations/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArrivalForecasts = async (id) => {
    setLoadingForecast(true);
    try {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const promises = months.map(m => 
        axios.post('http://localhost:8000/api/predict/arrivals', {
          destination_id: id,
          target_month: m
        })
      );
      const results = await Promise.all(promises);
      const formatted = results.map((r, idx) => ({
        monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
        arrivals: r.data.predicted_arrivals,
        occupancy: r.data.predicted_occupancy,
        crowd: r.data.crowd_level
      }));
      setForecastData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleDestChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedDestId(id);
    navigate(`/explore?id=${id}`);
  };

  if (!selectedDestId || !details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm font-extrabold text-slate-500">Loading details...</p>
      </div>
    );
  }

  const { destination, attractions, hotels, weather, ai_summary } = details;
  const transportList = destination.transport_options ? JSON.parse(destination.transport_options) : [];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Selector toolbar */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-display font-black text-slate-800">Destination Spot Explorer</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Visualize climate trends, local businesses, and travel demand.</p>
          </div>
          <div className="w-full sm:w-64">
            <select
              value={selectedDestId}
              onChange={handleDestChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-700 h-11"
            >
              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} ({d.state})</option>)}
            </select>
          </div>
        </div>

        {/* Hero Card Split */}
        <div className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-md mb-8 grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-80 lg:h-auto min-h-[320px]">
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-slate-950/70 backdrop-blur text-white font-extrabold text-[10px] px-4 py-1.5 rounded-xl uppercase tracking-widest shadow">
              {destination.state}
            </div>
          </div>
          
          <div className="p-8.5 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-display font-black text-slate-800">{destination.name}</h2>
              <p className="text-[15px] text-slate-500 mt-4 leading-relaxed font-semibold">{destination.description}</p>
              
              {/* Dynamic AI summary helper */}
              {ai_summary && (
                <div className="bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-primary/15 rounded-2xl p-5 mt-6 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed font-bold">{ai_summary}</p>
                </div>
              )}
            </div>

            {/* Transport details */}
            <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-slate-100">
              {transportList.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                  {t === 'Flight' && <Plane className="w-4 h-4 text-primary" />}
                  {t === 'Train' && <Train className="w-4 h-4 text-primary" />}
                  {t === 'Bus' && <Bus className="w-4 h-4 text-primary" />}
                  {t === 'Car' && <Car className="w-4 h-4 text-primary" />}
                  <span>{t}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Maps and Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[28px] p-6.5 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-primary" />
                Geospatial interactive overlay
              </h3>
              
              <div className="flex gap-4 text-xs font-bold text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAttractions}
                    onChange={(e) => setShowAttractions(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4.5 h-4.5 border-slate-200"
                  />
                  <span>Attractions</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHotels}
                    onChange={(e) => setShowHotels(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4.5 h-4.5 border-slate-200"
                  />
                  <span>Hotels</span>
                </label>
              </div>
            </div>

            <div className="h-96 rounded-2xl overflow-hidden relative border border-slate-100 z-10">
              <MapContainer
                center={[destination.lat, destination.lng]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <Marker position={[destination.lat, destination.lng]}>
                  <Popup>
                    <div className="text-center font-bold">
                      <span className="text-sm text-primary-dark font-extrabold">{destination.name}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{destination.state}</p>
                    </div>
                  </Popup>
                </Marker>

                {showAttractions && attractions.map((attr, idx) => (
                  <Marker
                    key={`attr-${idx}`}
                    position={[attr.lat, attr.lng]}
                    icon={attractionIcon}
                  >
                    <Popup>
                      <div className="font-bold">
                        <span className="text-xs text-emerald-600 block">{attr.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{attr.type}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-slate-700">{attr.rating} ★</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {showHotels && hotels.map((h, idx) => (
                  <Marker
                    key={`hotel-${idx}`}
                    position={[destination.lat + (idx * 0.005) - 0.003, destination.lng + (idx * 0.004) - 0.002]}
                    icon={hotelIcon}
                  >
                    <Popup>
                      <div className="font-bold">
                        <span className="text-xs text-amber-600 block">{h.name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">Average: ${h.avg_price}/night</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-slate-700">{h.rating} ★</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              </MapContainer>
            </div>
          </div>

          {/* Local Sights Listings panel */}
          <div className="bg-white border border-slate-200/60 rounded-[28px] p-6.5 shadow-sm flex flex-col h-[440px] overflow-hidden">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4.5 border-b border-slate-50 pb-2.5">Local Business Sights</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar">
              {attractions.map((attr, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                  <div>
                    <div className="text-xs font-extrabold text-slate-800 leading-snug">{attr.name}</div>
                    <div className="text-[9px] font-black text-primary uppercase mt-1 tracking-wider bg-primary/5 px-2 py-0.5 rounded-md inline-block">{attr.type}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{attr.rating}</span>
                  </div>
                </div>
              ))}
              {hotels.map((h, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                  <div>
                    <div className="text-xs font-extrabold text-slate-800 leading-snug">{h.name}</div>
                    <div className="text-[9px] font-black text-amber-500 uppercase mt-1 tracking-wider bg-amber-500/5 px-2 py-0.5 rounded-md inline-block">${h.avg_price}/night</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{h.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Forecast charts */}
        <div className="bg-white border border-slate-200/60 rounded-[28px] p-7 shadow-sm mb-8">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-1">
              <Sparkles className="text-primary w-4.5 h-4.5" />
              Machine Learning Tourist Flow Forecasts
            </h3>
            <p className="text-xs font-semibold text-slate-400 mb-6">Arrival predictions generated based on temperature, rainfall, and historical volume coefficients.</p>
          </div>

          <div className="h-80">
            {loadingForecast ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ left: 15, right: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="monthName" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    formatter={(value) => [value.toLocaleString(), 'Predicted Arrivals']}
                  />
                  <Area type="monotone" dataKey="arrivals" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorArrivals)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Climate Profiles Monthly Table */}
        <div className="bg-white border border-slate-200/60 rounded-[28px] p-7 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Thermometer className="w-4.5 h-4.5 text-secondary" />
            Seasonal Climate Analytics Table
          </h3>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-100 scrollbar">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-bold text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-widest text-[9px] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Avg Temp (°C)</th>
                  <th className="px-6 py-4">Rainfall (mm)</th>
                  <th className="px-6 py-4">Humidity (%)</th>
                  <th className="px-6 py-4">Wind Speed (km/h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {weather.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800">
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][w.month - 1]}
                    </td>
                    <td className="px-6 py-4">{w.avg_temp}°C</td>
                    <td className="px-6 py-4">{w.rainfall} mm</td>
                    <td className="px-6 py-4">{w.humidity}%</td>
                    <td className="px-6 py-4">{w.wind_speed} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
