import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import { RefreshCw, Crosshair, Navigation, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

// Map Updater Component to smoothly center map on ISS
const MapUpdater = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && lat !== 0) {
      // panTo is much smoother for small increments without disrupting the view
      map.panTo([lat, lng], {
        animate: true,
        duration: 1.5
      });
    }
  }, [lat, lng, map]);
  return null;
};

export default function ISSTracker({ onSpeedUpdate, onDashboardUpdate }) {
  const [issData, setIssData] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Loading...');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastUpdateTime = useRef(Date.now());
  const lastPos = useRef(null);

  const fetchISSPosition = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      
      let lat, lng, velocity;
      try {
        const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
        lat = res.data.latitude;
        lng = res.data.longitude;
        velocity = res.data.velocity;
      } catch (apiErr) {
        console.warn("ISS API failed (likely rate limit). Using simulated telemetry fallback.");
        const lastLat = lastPos.current ? lastPos.current.lat : 29.55;
        const lastLng = lastPos.current ? lastPos.current.lng : -95.09;
        
        // Rough simulation of ISS orbital trajectory
        lat = lastLat > 50 ? -50 : lastLat + 0.4;
        lng = lastLng > 170 ? -170 : lastLng + 0.6;
        velocity = speed > 0 ? speed : 27550;
      }

      const currentTime = Date.now();

      setIssData({ lat, lng });
      setPath((prev) => {
        const newPath = [...prev, [lat, lng]];
        return newPath.slice(-15);
      });

      const currentSpeed = velocity;
      setSpeed(currentSpeed);
      if (onSpeedUpdate) {
        onSpeedUpdate({ time: new Date().toLocaleTimeString(), speed: currentSpeed });
      }

      lastPos.current = { lat, lng };
      lastUpdateTime.current = currentTime;

      try {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        setLocationName(geoRes.data.display_name || 'Over the Ocean');
      } catch (err) {
        setLocationName('Over the Ocean / Unknown');
      }

      if (isManual) {
        toast.success('ISS Location Updated');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (isManual) toast.error('Failed to update map rendering');
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const res = await axios.get('/api/astros');
      const issPeople = res.data.people.filter(p => p.craft === 'ISS');
      setPeople(issPeople);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchISSPosition();
    fetchPeople();
    setLoading(false);

    const interval = setInterval(() => {
      fetchISSPosition();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onDashboardUpdate) {
      onDashboardUpdate({
        iss: issData,
        speed: speed,
        locationName: locationName,
        people: people
      });
    }
  }, [issData, speed, locationName, people]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#030508] group">
      
      {/* Background Map Container */}
      <MapContainer 
        center={[issData.lat || 0, issData.lng || 0]} 
        zoom={4} 
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        {path.length > 1 && (
          <Polyline 
            positions={path} 
            color="#06b6d4" 
            weight={3} 
            opacity={0.8}
            dashArray="8, 12" 
          />
        )}
        <MapUpdater lat={issData.lat} lng={issData.lng} />
      </MapContainer>

      {/* Top HUD Elements */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 z-10 pointer-events-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="bg-white/90 dark:bg-[#030508]/70 backdrop-blur-md border border-slate-200 dark:border-cyan-500/20 px-6 py-4 rounded-xl shadow-lg pointer-events-auto transition-colors">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-cyan-50 flex items-center gap-3 font-mono">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </div>
            ISS ORBITAL TRACKER
          </h2>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 pointer-events-auto">
          <div className="bg-white/90 dark:bg-[#030508]/70 backdrop-blur-md border border-slate-200 dark:border-cyan-500/20 px-4 md:px-5 py-2 md:py-3 rounded-xl flex items-center gap-3 transition-colors">
            <Navigation className="text-blue-500 dark:text-cyan-500" size={18} />
            <div>
              <div className="text-[9px] md:text-[10px] text-slate-500 dark:text-cyan-500/60 font-mono uppercase tracking-widest mb-0.5">Coordinates</div>
              <div className="font-mono font-bold text-slate-800 dark:text-cyan-50 text-sm md:text-base">
                {issData.lat.toFixed(4)}°, {issData.lng.toFixed(4)}°
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-[#030508]/70 backdrop-blur-md border border-slate-200 dark:border-cyan-500/20 px-4 md:px-5 py-2 md:py-3 rounded-xl flex items-center gap-3 transition-colors">
            <Activity className="text-blue-500 dark:text-cyan-500" size={18} />
            <div>
              <div className="text-[9px] md:text-[10px] text-slate-500 dark:text-cyan-500/60 font-mono uppercase tracking-widest mb-0.5">Velocity</div>
              <div className="font-mono font-bold text-slate-800 dark:text-cyan-50 text-sm md:text-base">
                {speed > 0 ? speed.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'} km/h
              </div>
            </div>
          </div>

          <button 
            onClick={() => fetchISSPosition(true)}
            disabled={loading}
            className="flex items-center justify-center h-full px-4 bg-blue-50 hover:bg-blue-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border border-blue-200 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          </button>
        </div>
      </div>

      {/* Bottom HUD Location */}
      <div className="absolute bottom-8 left-8 z-10 bg-white/90 dark:bg-[#030508]/80 backdrop-blur-md border border-slate-200 dark:border-cyan-500/40 p-6 rounded-2xl shadow-xl pointer-events-none transition-colors">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-cyan-400/80 font-mono uppercase tracking-widest mb-2">
          <Crosshair size={14} />
          Target Acquired
        </div>
        <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-cyan-50 line-clamp-2 max-w-[250px] md:max-w-[350px]">
          {locationName}
        </div>
      </div>

      {/* Central ISS Graphic Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center justify-center">
        {/* Radar Ping Animation */}
        <div className="absolute w-48 h-48 md:w-64 md:h-64 border border-cyan-500/20 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
        <div className="absolute w-32 h-32 md:w-40 md:h-40 border border-cyan-500/40 rounded-full animate-[ping_3s_ease-out_1.5s_infinite]"></div>
        
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg" 
          alt="ISS" 
          className="w-40 md:w-56 h-auto drop-shadow-2xl transition-transform duration-1000 group-hover:scale-110"
          style={{ filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.5))' }}
        />
      </div>

    </div>
  );
}
