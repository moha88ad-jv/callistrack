import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, Star } from 'lucide-react';
import type { Spot } from '../../types';

// Fix Leaflet default icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS: Record<string, string> = {
  validated: '#22c55e',
  'top-rated': '#f59e0b',
  'user-created': '#3b82f6',
  unvalidated: '#9ca3af',
};

function createColoredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="12.5" cy="12.5" r="5" fill="white"/></svg>`;
  return L.divIcon({ html: svg, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -41], className: '' });
}

interface ActivityTabProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  highlightedEquipment?: string[];
}

export function ActivityTab({ spots, onSpotClick }: ActivityTabProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const toggleTracking = () => {
    if (isTracking) {
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
    } else {
      const id = setInterval(() => setDuration((d) => d + 1), 1000);
      setIntervalId(id);
    }
    setIsTracking(!isTracking);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-lg">{formatTime(duration)}</span>
        <button onClick={toggleTracking} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${isTracking ? 'bg-red-500' : 'bg-green-500'}`}>
          {isTracking ? <Pause size={14} /> : <Play size={14} />}
          {isTracking ? 'Pause' : 'START'}
        </button>
      </div>
      <div className="flex-1 relative">
        <MapContainer center={[50.0297, 8.2399]} zoom={13} style={{ height: '60%', width: '100%' }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {spots.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={createColoredIcon(STATUS_COLORS[spot.status] ?? '#6b7280')}>
              <Popup>
                <p className="font-semibold text-sm">{spot.name}</p>
                <button onClick={() => onSpotClick(spot)} className="bg-green-500 text-white text-xs px-3 py-1 rounded-full mt-1">Details</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="bg-white border-t overflow-y-auto" style={{ height: '40%' }}>
          {spots.map((spot) => (
            <button key={spot.id} onClick={() => onSpotClick(spot)} className="w-full text-left px-4 py-2.5 border-b hover:bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{spot.name}</p>
                <p className="text-xs text-gray-500">{spot.address}</p>
              </div>
              {spot.rating > 0 && <span className="flex items-center gap-1 text-xs text-yellow-600"><Star size={12} fill="currentColor" />{spot.rating.toFixed(1)}</span>}
            </button>
          ))}
          {spots.length === 0 && <p className="text-center text-sm text-gray-400 py-6">Keine Spots gefunden</p>}
        </div>
      </div>
    </div>
  );
}
