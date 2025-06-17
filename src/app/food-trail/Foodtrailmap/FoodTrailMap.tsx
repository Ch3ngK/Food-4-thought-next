'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import './FoodTrailMap.css';

// Fix missing default icon issue
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

function RoutingMachine({ points, mode }: { points: [number, number][], mode: 'foot' | 'car' | 'bike' }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length < 2) return;

    console.log("Waypoints for routing:", points);

    const waypoints = points.map(([lat, lng]) => {
      const latLng = L.latLng(lat, lng);
      console.log("Waypoint:", latLng);
      return latLng;
    });

    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      show: true,
      addWaypoints: false,
      lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1/${mode}`,
      }),
      createMarker: (i, wp) => L.marker(wp.latLng).bindPopup(`Stop ${i + 1}`),
      collapsible: true,
      container: document.getElementById('sidebar-directions') || undefined,
    })
      .on('routingerror', (err) => {
        console.error('Routing error occurred:', err);
      })
      .addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, points, mode]);

  return null;
}

export default function FoodTrailMap() {
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [mode, setMode] = useState<'foot' | 'car' | 'bike'>('foot');

  useEffect(() => {
    const fetchLocations = async () => {
      const locParams = searchParams.getAll('location');
      const geocoded: Location[] = [];

      for (const name of locParams) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`
        );
        const data = await res.json();

        if (data && data.length > 0 && !isNaN(parseFloat(data[0].lat)) && !isNaN(parseFloat(data[0].lon))) {
          geocoded.push({
            name,
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          console.warn(`No geocode result for: ${name}`);
        }
      }

      console.log("Geocoded locations:", geocoded);
      setLocations(geocoded);
    };

    fetchLocations();
  }, [searchParams]);

  if (locations.length === 0) {
    return <p style={{ padding: '1rem', textAlign: 'center' }}>Loading map or no locations provided.</p>;
  }

  const waypoints: [number, number][] = locations.map(loc => [loc.lat, loc.lng]);

  return (
    <div className="foodtrailmapcontainer">
      <div className="background-img-ftm"></div>

      {/* Sidebar Directions */}
      <div
        id="sidebar-directions"
        style={{
          width: '300px',
          height: '100%',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'white',
          position: 'absolute',
          zIndex: 1000,
        }}
      ></div>

      {/* Map */}
      <div className="map-container">
        <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {locations.map((loc, idx) => (
            <Marker key={idx} position={[loc.lat, loc.lng]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
          <RoutingMachine points={waypoints} mode={mode} />
        </MapContainer>
      </div>

      {/* Mode Switcher */}
      <div style={{ position: 'absolute', top: 10, left: 320, zIndex: 1000, display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setMode('foot')}>🚶 Walking</button>
        <button onClick={() => setMode('car')}>🚗 Driving</button>
        <button onClick={() => setMode('bike')}>🚴 Cycling</button>
      </div>
    </div>
  );
}
