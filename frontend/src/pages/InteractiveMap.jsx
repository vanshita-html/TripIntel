import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Map, MapPin, Compass, Thermometer, Sparkles, Filter, Info, Eye } from 'lucide-react';
import L from 'leaflet';

export default function InteractiveMap() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState(null);
  
  const [showDensityHeatmap, setShowDensityHeatmap] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/destinations');
      
      const promises = res.data.map(d => axios.get(`http://localhost:8000/api/destinations/${d.id}`));
      const detailsList = await Promise.all(promises);
      
      const compiled = res.data.map((d, idx) => {
        const detail = detailsList[idx].data;
        const octWeather = detail.weather.find(w => w.month === 10) || detail.weather[0];
        
        return {
          ...d,
          weather: octWeather,
          hotelsCount: detail.hotels.length,
          attractionsCount: detail.attractions.length,
          avgRating: detail.hotels.length > 0 ? (detail.hotels.reduce((sum, h) => sum + h.rating, 0) / detail.hotels.length).toFixed(1) : "4.2"
        };
      });

      setDestinations(compiled);
      if (compiled.length > 0) {
        setSelectedDest(compiled[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (name) => {
    if (["Goa", "Jaipur", "Kerala"].includes(name)) return "#EF4444";
    if (["Ladakh", "Kashmir", "Andaman Islands"].includes(name)) return "#F59E0B";
    return "#10B981";
  };

  const getHeatRadius = (name) => {
    if (["Goa", "Jaipur", "Kerala"].includes(name)) return 45000;
    if (["Ladakh", "Kashmir", "Andaman Islands"].includes(name)) return 30000;
    return 18000;
  };

  if (loading || destinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm font-extrabold text-slate-500">Loading map overlay nodes...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full relative flex font-sans">
      
      {/* Sidebar controls */}
      <div className="w-80 h-full bg-white border-r border-slate-100 flex flex-col z-[1002] shadow-xl relative flex-shrink-0">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-display font-extrabold text-slate-800 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Tourism Map analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Track crowds and weather indicators across India.</p>
        </div>

        {/* Map Layers Filters */}
        <div className="p-5 border-b border-slate-100 space-y-3.5 bg-slate-50/50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </div>
          
          <label className="flex items-center justify-between text-xs font-bold text-slate-600 cursor-pointer p-1">
            <span>Tourist Crowd Density</span>
            <input
              type="checkbox"
              checked={showDensityHeatmap}
              onChange={(e) => setShowDensityHeatmap(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4.5 h-4.5 border-slate-200"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-bold text-slate-600 cursor-pointer p-1">
            <span>Active Weather Overlay</span>
            <input
              type="checkbox"
              checked={showWeatherOverlay}
              onChange={(e) => setShowWeatherOverlay(e.target.checked)}
              className="rounded text-secondary focus:ring-secondary w-4.5 h-4.5 border-slate-200"
            />
          </label>
        </div>

        {/* Details card */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar">
          {selectedDest ? (
            <div className="space-y-5.5">
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-100 relative shadow-sm">
                <img src={selectedDest.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3.5 left-3.5 bg-slate-950/75 backdrop-blur text-white font-extrabold text-[9px] px-3 py-1 rounded-xl uppercase tracking-widest">
                  {selectedDest.state}
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-800">{selectedDest.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed font-semibold">{selectedDest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Rating</span>
                  <span className="text-slate-850 font-extrabold mt-1 block">{selectedDest.avgRating} ★</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Climate temp</span>
                  <span className="text-slate-850 font-extrabold mt-1 block flex items-center justify-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-accent-dark inline" />
                    {selectedDest.weather?.avg_temp}°C
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/explore?id=${selectedDest.id}`)}
                className="w-full py-3 bg-gradient-to-tr from-primary to-secondary hover:brightness-105 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Open Explorer Profile</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-450 py-10 font-bold">
              Select a pin marker on the map to display details.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="flex-grow h-full z-10">
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {destinations.map((d, idx) => (
            <React.Fragment key={idx}>
              
              <Marker
                position={[d.lat, d.lng]}
                eventHandlers={{
                  click: () => setSelectedDest(d)
                }}
              >
                <Popup>
                  <div className="text-center p-1 font-bold">
                    <span className="text-sm text-primary-dark font-extrabold">{d.name}</span>
                    <div className="text-[10px] text-slate-500 mt-1 font-semibold">Sights: {d.attractionsCount} | Hotels: {d.hotelsCount}</div>
                    <button
                      onClick={() => navigate(`/explore?id=${d.id}`)}
                      className="mt-2 text-[9px] font-black text-primary hover:text-primary-dark tracking-widest uppercase block w-full"
                    >
                      Explorer Profile →
                    </button>
                  </div>
                </Popup>
              </Marker>

              {showDensityHeatmap && (
                <Circle
                  center={[d.lat, d.lng]}
                  radius={getHeatRadius(d.name)}
                  pathOptions={{
                    fillColor: getHeatColor(d.name),
                    color: getHeatColor(d.name),
                    fillOpacity: 0.15,
                    weight: 1
                  }}
                />
              )}

              {showWeatherOverlay && d.weather && (
                <Circle
                  center={[d.lat - 0.15, d.lng + 0.15]}
                  radius={12000}
                  pathOptions={{
                    fillColor: '#3B82F6',
                    color: '#3B82F6',
                    fillOpacity: 0.45,
                    weight: 1
                  }}
                />
              )}

            </React.Fragment>
          ))}

        </MapContainer>
      </div>

    </div>
  );
}
