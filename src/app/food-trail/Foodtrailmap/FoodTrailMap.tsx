'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import './FoodTrailMap.css';
import Image from 'next/image';

mapboxgl.accessToken = 'pk.eyJ1Ijoia3c0NTYiLCJhIjoiY21idWF2YXZ3MGQ5dTJrcHU3OXNmeTF4ayJ9.FOm1RDktfh41mC-BY8woNA';

const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;

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
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [mode, setMode] = useState<'driving' | 'walking' | 'cycling'>('walking');
  const imageURL = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//Food4Thought.png';

useEffect(() => {
  const fetchLocations = async () => {
    const locParams = searchParams.getAll('location');
    const fetched: Location[] = [];

    for (const name of locParams) {
      try {
        const res = await fetch(
          `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(name)}&ll=1.3521,103.8198&radius=3000&limit=1`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: FOURSQUARE_API_KEY ?? '',
            },
          }
        );

        await new Promise((res) => setTimeout(res, 300));
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const place = data.results[0];
          fetched.push({
            name: place.name,
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          });
        } else {
          // 🌍 Fallback to OpenStreetMap if Foursquare failed
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`
          );
          const osmData = await osmRes.json();

          if (osmData.length > 0) {
            fetched.push({
              name,
              lat: parseFloat(osmData[0].lat),
              lng: parseFloat(osmData[0].lon),
            });
          } else {
            console.warn(`Could not find location: ${name}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${name}:`, error);
      }
    }

    setLocations(fetched);
  };

  fetchLocations();
}, [searchParams]);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({
            name: 'Your Location',
            lat: latitude,
            lng: longitude,
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [103.8198, 1.3521],
      zoom: 12,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl());

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !userLocation || locations.length === 0) return;
    const map = mapRef.current;

    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setText('Your Location'))
      .addTo(map);

    locations.forEach((loc) => {
      new mapboxgl.Marker()
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new mapboxgl.Popup().setText(loc.name))
        .addTo(map);
    });

    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
  }, [locations, userLocation]);

  useEffect(() => {
    if (!mapRef.current || !userLocation || locations.length === 0) return;

    const map = mapRef.current;
    const allPoints = [userLocation, ...locations];
    const coords = allPoints.map((loc) => `${loc.lng},${loc.lat}`).join(';');

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

        if (!map.getSource('route')) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: routeGeo,
              properties: {}
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
            [Math.min(...allPoints.map((l) => l.lng)), Math.min(...allPoints.map((l) => l.lat))],
            [Math.max(...allPoints.map((l) => l.lng)), Math.max(...allPoints.map((l) => l.lat))],
          ],
          { padding: 40 }
        );
      }
    };

    if (map.isStyleLoaded()) {
      fetchRoute();
    } else {
      map.once('load', fetchRoute);
    }
  }, [userLocation, locations, mode]);

  return (
    <div className="foodtrailmapcontainer">
      <div className="background-img-ftm"></div>
      <Image className="logo-ftm" src={imageURL} alt="Food" width={200} height={300} />

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
            <br />
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
