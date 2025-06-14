'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './FoodTrailMap.css';

// Default marker fix (because Leaflet icon won't show in some setups)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  name: string;
  lat: number;
  lng: number;
}

export default function FoodTrailMap() {
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locParams = searchParams.getAll('location');
      const geocoded: Location[] = [];

      for (const name of locParams) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`
        );
        const data = await res.json();

        if (data[0]) {
          geocoded.push({
            name,
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      }

      setLocations(geocoded);
    };

    fetchLocations();
  }, [searchParams]);

    if (locations.length === 0) {
  return <p style={{ padding: '1rem', textAlign: 'center' }}>Loading map or no locations provided.</p>;
  }

return (
  <div className="map-container">
    <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {locations.map((loc, idx) => (
        <Marker key={idx} position={[loc.lat, loc.lng]}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);
}
