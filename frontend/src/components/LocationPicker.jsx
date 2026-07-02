import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Leaflet default marker icon fix (Vite ke saath icon load nahi hota by default)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map pe click hone par marker place karta hai
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const defaultCenter = [25.5941, 85.1376]; // Patna, Bihar — apna default city daal sakte ho

  const handlePick = async (lat, lng) => {
    setPosition([lat, lng]);
    setLoadingAddress(true);

    try {
      // Nominatim (OpenStreetMap ka free reverse-geocoding service)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const displayAddress = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(displayAddress);
      onLocationSelect({ address: displayAddress, lat, lng });
    } catch (err) {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(fallback);
      onLocationSelect({ address: fallback, lat, lng });
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-ink/15 mb-2" style={{ height: 280 }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <div className="flex items-start gap-2 text-sm">
        <MapPin size={16} className="text-emerald mt-0.5 shrink-0" />
        {loadingAddress ? (
          <span className="text-muted">Fetching address...</span>
        ) : address ? (
          <span className="text-ink">{address}</span>
        ) : (
          <span className="text-muted">Click on the map to pick your pickup location</span>
        )}
      </div>
    </div>
  );
}