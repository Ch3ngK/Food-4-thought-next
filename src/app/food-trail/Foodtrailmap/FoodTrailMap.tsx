'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import './FoodTrailMap.css';
import Image from 'next/image';
import { supabase } from '@/app/supabaseClient';

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
  const [showForm, setShowForm] = useState(false);
  const [trailName, setTrailName] = useState('');
  const [trailDesc, setTrailDesc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [trailDuration, setTrailDuration] = useState('');
  const [trailDesc2, setTrailDesc2] = useState('');
  const [trailRating, setTrailRating] = useState('');


  useEffect(() => {
  const fetchLocations = async () => {
    const locParam = searchParams.get('locations');
    let locNames: string[] = [];

    if (locParam) {
      // ✅ Case 1: Locations passed via URL
      locNames = locParam.split(',').map((loc) => loc.trim());
    } else {
      // ✅ Case 2: Fallback to Supabase (User-created trails)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('food_trail_locations')
          .select('title')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error fetching locations from Supabase:", error);
          return;
        }

        locNames = data.map((loc: any) => loc.title);
      } catch (err) {
        console.error("Auth error or Supabase issue:", err);
        return;
      }
    }

    const fetched: Location[] = [];
    for (const name of locNames) {
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

        await new Promise((res) => setTimeout(res, 300)); // small delay to avoid throttling
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const place = data.results[0];
          fetched.push({
            name: place.name,
            lat: place.geocodes.main.latitude,
            lng: place.geocodes.main.longitude,
          });
        } else {
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
  
const handleShareTrail = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !imageFile) return;

    const slug = trailName.toLowerCase().replace(/\s+/g, '-');

    // Correct stops = number of stops (integer)
    const stopsCount = locations.length;

    // destinations = comma separated place names (string)
    const destinationsString = locations.map((loc) => loc.name).join(', ');

    // Upload image
    const { data: imageData, error: imageError } = await supabase.storage
      .from('pictures')
      .upload(`${Date.now()}-${imageFile.name}`, imageFile);

    if (imageError || !imageData) {
      throw new Error("Image upload failed");
    }

    const imageUrl = `https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/${imageData.path}`;

    // Insert into Supabase
    const { error: insertError } = await supabase.from('food_trails').insert({
      slug,
      name: trailName,
      description: trailDesc,
      imageUrl,
      rating: parseFloat(trailRating),
      stops: stopsCount,         // <-- number of stops (integer)
      destinations: destinationsString, // <-- string of place names
      duration: parseFloat(trailDuration),
      description2: trailDesc2 || '',
      created_at: new Date(),
    });

    if (insertError) {
      console.error('Supabase Insert Error:', insertError.message, insertError.details);
      throw insertError;
    }

    alert('Trail shared successfully!');
    setShowForm(false);
    setTrailName('');
    setTrailDesc('');
    setImageFile(null);
    setTrailDuration('');
    setTrailDesc2('');
  } catch (err: any) {
    console.error('Error sharing trail:', err.message, err.details || '', err);
    alert('Failed to share trail. ' + (err.message || 'Please try again.'));
  }
};


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

      <button className="share-trail-button" onClick={() => setShowForm(true)}>
        📤 Share This Trail
      </button>

        {showForm && (
          <div className="share-form-overlay">
            <form className="share-form" onSubmit={handleShareTrail}>
              <h2 className="share-form-title">📤 Share Your Food Trail</h2>

              <label className="form-label">Trail Name</label>
              <input
                type="text"
                placeholder="e.g. Balestier Brunch Trail"
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                required
                className="form-input"
              />

              <label className="form-label">Description</label>
              <textarea
                placeholder="Describe your food trail in 1–2 sentences"
                value={trailDesc}
                onChange={(e) => setTrailDesc(e.target.value)}
                required
                className="form-textarea"
              />

              <label className="form-label">Upload an image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
                className="form-file"
              />

              <label className="form-label">Approx. Duration (hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2.5"
                value={trailDuration}
                onChange={(e) => setTrailDuration(e.target.value)}
                required
                className="form-input"
              />

              <label className="form-label">Rating (1 to 5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                placeholder="e.g. 4.5"
                value={trailRating}
                onChange={(e) => setTrailRating(e.target.value)}
                required
                className="form-input"
              />

              <label className="form-label">Optional: Fun Fact or Additional Description</label>
              <textarea
                placeholder="e.g. Perfect for brunch lovers or night owls"
                value={trailDesc2}
                onChange={(e) => setTrailDesc2(e.target.value)}
                className="form-textarea"
              />

              <div className="modal-buttons">
                <button type="submit">✅ Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>❌ Cancel</button>
              </div>
            </form>
          </div>
        )}

      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
