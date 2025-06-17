'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import './FoodTrailMap.css';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';

mapboxgl.accessToken = 'pk.eyJ1Ijoia3c0NTYiLCJhIjoiY21idWF2YXZ3MGQ5dTJrcHU3OXNmeTF4ayJ9.FOm1RDktfh41mC-BY8woNA';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

export default function FoodTrailMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [mode, setMode] = useState<'driving' | 'walking' | 'cycling'>('walking');
  const imageURL = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//Food4Thought.png';

  useEffect(() => {
    const fetchLocations = async () => {
      const locParams = searchParams.getAll('location');
      const geocoded: Location[] = [];

      for (const name of locParams) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`
        );
        const data = await res.json();

        if (data.length > 0) {
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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [103.8198, 1.3521], // Default Singapore
      zoom: 12,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
      // Add location markers
      locations.forEach((loc) => {
        new mapboxgl.Marker()
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.Popup().setText(loc.name))
          .addTo(map);
      });

      // Try to show user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            new mapboxgl.Marker({ color: 'red' })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setText('Your Location'))
              .addTo(map);

            map.flyTo({ center: [longitude, latitude], zoom: 14 });
          },
          (err) => {
            console.error('Geolocation error:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          }
        );
      }
    });

    return () => map.remove();
  }, [locations]);

  useEffect(() => {
    if (locations.length < 2 || !mapRef.current) return;

    const coords = locations.map((loc) => `${loc.lng},${loc.lat}`).join(';');

    const fetchRoute = async () => {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coords}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeGeo = data.routes[0].geometry;
        const routeSteps = data.routes[0].legs.flatMap((leg: any) =>
          leg.steps.map((s: any) => s.maneuver.instruction)
        );
        const summaryInfo = {
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
        };

        setRoute(routeGeo);
        setSteps(routeSteps);
        setSummary(summaryInfo);

        const map = mapRef.current;
        if (!map.getSource('route')) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: routeGeo,
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#1db7dd',
              'line-width': 5,
            },
          });
        } else {
          (map.getSource('route') as any).setData({
            type: 'Feature',
            geometry: routeGeo,
          });
        }

        map.fitBounds(
          [
            [Math.min(...locations.map((l) => l.lng)), Math.min(...locations.map((l) => l.lat))],
            [Math.max(...locations.map((l) => l.lng)), Math.max(...locations.map((l) => l.lat))],
          ],
          { padding: 40 }
        );
      }
    };

    if (mapRef.current.isStyleLoaded()) {
      fetchRoute();
    } else {
      mapRef.current.once('load', fetchRoute);
    }
  }, [locations, mode]);

  return (
    <div className="foodtrailmapcontainer">
      <div className="background-img-ftm"></div>
      <Image 
        className="logo-ftm"
        src={imageURL} 
        alt="Food" 
        width={200} 
        height={300} 
      />

      <div className="map-controls">
        <button className="walking-button" onClick={() => setMode('walking')}>🚶 Walking</button>
        <button className="driving-button" onClick={() => setMode('driving')}>🚗 Driving</button>
        <button className="cycling-button" onClick={() => setMode('cycling')}>🚴 Cycling</button>
      </div>

      <div className="sidebar">
        {summary && (
          <>
            <div className='summary-header'>Summary</div>
            <p>Distance: {(summary.distance / 1000).toFixed(2)} km</p>
            <p>Duration: {(summary.duration / 60).toFixed(1)} min</p>
          </>
        )}
        {steps.length > 0 && (
          <>
          <br></br>
            <div className='directions-header'>Directions</div>
            <ol>
              {steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </>
        )}
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
