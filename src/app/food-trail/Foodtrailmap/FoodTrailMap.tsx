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
const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

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
  const [googleReady, setGoogleReady] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const locationParam = searchParams.get('location');

  interface WindowWithGoogle extends Window {
  google?: {
    maps: {
      places: {
        PlacesService: new (div: HTMLDivElement) => any;
        PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
          [key: string]: string;
        };
      };
    };
  };
}

  // Improved Google Maps script loading
useEffect(() => {
  const loadGoogleMaps = () => {
    if ((window as WindowWithGoogle).google?.maps?.places) {
      setGoogleReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        initGoogleMaps();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGoogleMaps();
    };
    script.onerror = () => {
      console.error('Google Maps script failed to load');
    };
    document.head.appendChild(script);
  };

  const initGoogleMaps = () => {
    // Wait for google.maps to be available
    const checkReady = () => {
      if ((window as WindowWithGoogle).google?.maps?.places) {
        setGoogleReady(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  };

  loadGoogleMaps();

  return () => {
    // Cleanup if needed
  };
}, []);


  // Enhanced Google Places lookup with retries
// Update your getPlaceCoords function to this more robust version:
const getPlaceCoords = async (query: string): Promise<Location | null> => {
  const win = window as WindowWithGoogle;
  
  if (!win.google?.maps?.places) {
    console.warn('Google Maps Places API not loaded');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const service = new win.google.maps.places.PlacesService(
        document.createElement('div')
      );

      // First try textSearch which is more flexible
      service.textSearch(
        {
          query: `${query}, Singapore`,
          location: new win.google.maps.LatLng(1.3521, 103.8198),
          radius: 5000
        },
        (results, status) => {
          if (status === win.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.geometry?.location) {
            console.log(`Found "${query}" via textSearch`);
            resolve({
              name: results[0].name || query,
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          } else {
            // Fallback to findPlaceFromQuery if textSearch fails
            console.log(`Trying findPlaceFromQuery for "${query}"`);
            service.findPlaceFromQuery(
              {
                query: `${query}, Singapore`,
                fields: ['name', 'geometry'],
                locationBias: new win.google.maps.LatLngBounds(
                  new win.google.maps.LatLng(1.2, 103.6),
                  new win.google.maps.LatLng(1.5, 104.0)
                )
              },
              (findResults, findStatus) => {
                if (findStatus === win.google.maps.places.PlacesServiceStatus.OK && 
                    findResults?.[0]?.geometry?.location) {
                  console.log(`Found "${query}" via findPlaceFromQuery`);
                  resolve({
                    name: findResults[0].name || query,
                    lat: findResults[0].geometry.location.lat(),
                    lng: findResults[0].geometry.location.lng()
                  });
                } else {
                  // Final fallback to geocoding
                  console.log(`Trying geocoding for "${query}"`);
                  new win.google.maps.Geocoder().geocode(
                    { address: `${query}, Singapore` },
                    (geoResults, geoStatus) => {
                      if (geoStatus === win.google.maps.GeocoderStatus.OK && 
                          geoResults?.[0]?.geometry?.location) {
                        console.log(`Found "${query}" via geocoding`);
                        resolve({
                          name: query, // Use original name since geocoding might return different
                          lat: geoResults[0].geometry.location.lat(),
                          lng: geoResults[0].geometry.location.lng()
                        });
                      } else {
                        console.warn(`Could not find location: ${query}`);
                        resolve(null);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    } catch (error) {
      console.error(`Google Places error for ${query}:`, error);
      resolve(null);
    }
  });
};

useEffect(() => {
  const fetchLocations = async () => {
    const locParam = searchParams.get('locations');
    let locNames: string[] = [];

if (locParam) {
    // Split by comma and decode each location
    locNames = locParam.split(',').map(loc => decodeURIComponent(loc.trim()));
  } else {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_trail_locations')
        .select('title')
        .eq('user_id', user.id);

      if (error) throw error;
      locNames = data.map((loc: any) => loc.title);
    } catch (err) {
      console.error("Error fetching locations:", err);
      return;
    }
  }


    const fetched: Location[] = [];

    for (const name of locNames) {
      try {
        // Try Foursquare first
        if (FOURSQUARE_API_KEY) {
          const fsqRes = await fetch(
            `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(name)}&ll=1.3521,103.8198&radius=3000&limit=1`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: FOURSQUARE_API_KEY,
              },
            }
          );
          
          if (fsqRes.ok) {
            const fsqData = await fsqRes.json();
            if (fsqData.results?.[0]?.geocodes?.main) {
              fetched.push({
                name: fsqData.results[0].name || name,
                lat: fsqData.results[0].geocodes.main.latitude,
                lng: fsqData.results[0].geocodes.main.longitude,
              });
              continue;
            }
          }
        }

        // Fallback to OpenStreetMap
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ' Singapore')}`
        );
        
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          if (osmData[0]?.lat && osmData[0]?.lon) {
            fetched.push({
              name: osmData[0].display_name.split(',')[0] || name,
              lat: parseFloat(osmData[0].lat),
              lng: parseFloat(osmData[0].lon),
            });
            continue;
          }
        }

        // Final fallback to Google Places
        if (googleReady && GOOGLE_PLACES_API_KEY) {
          const googlePlace = await getPlaceCoords(name);
          if (googlePlace) {
            fetched.push(googlePlace);
            continue;
          }
        }

        console.warn(`Could not find location: ${name}`);
      } catch (error) {
        console.error(`Error processing ${name}:`, error);
      }
    }

    // Filter out any invalid locations before setting state
    const validLocations = fetched.filter(loc => 
      !isNaN(loc.lat) && 
      !isNaN(loc.lng) &&
      Math.abs(loc.lat) <= 90 &&
      Math.abs(loc.lng) <= 180
    );

    setLocations(validLocations);
  };

  fetchLocations();
}, [searchParams, googleReady]);


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

  // 1. First, keep your map initialization useEffect (unchanged)
useEffect(() => {
  if (!mapContainer.current) return;

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [103.8198, 1.3521],
    zoom: 12,
  });

  map.on('load', () => {
    setMapLoaded(true); // Add this line to track when map is ready
  });

  mapRef.current = map;
  map.addControl(new mapboxgl.NavigationControl());

  return () => map.remove();
}, []);

// 2. Replace ALL the other marker/route effects with your improved version:
useEffect(() => {
  if (!mapRef.current || !mapLoaded) return;

  // Clear existing markers
  markersRef.current.forEach(marker => marker.remove());
  markersRef.current = [];

  // Add user location marker if available
  if (userLocation) {
    const marker = new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${userLocation.name}</strong>`))
      .addTo(mapRef.current);
    markersRef.current.push(marker);
  }

  // Add location markers
  locations.forEach(location => {
    if (!isNaN(location.lng) && !isNaN(location.lat)) {
      const marker = new mapboxgl.Marker()
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.name}</strong>`))
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    }
  });

  // Calculate and draw route if we have locations
  if (locations.length > 0 && userLocation) {
    const allPoints = [userLocation, ...locations];
    const coords = allPoints.map((loc) => `${loc.lng},${loc.lat}`).join(';');

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coords}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
        );
        const data = await res.json();

        if (data.routes?.[0]) {
          setRoute(data.routes[0].geometry);
          setSteps(data.routes[0].legs.flatMap((leg: any) => 
            leg.steps.map((s: any) => s.maneuver.instruction)
          ));
          setSummary({
            distance: data.routes[0].distance,
            duration: data.routes[0].duration
          });

          const map = mapRef.current;
          if (map) {
            if (map.getSource('route')) {
              (map.getSource('route') as any).setData({
                type: 'Feature',
                geometry: data.routes[0].geometry
              });
            } else {
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: data.routes[0].geometry,
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
            }
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }

  // Fit bounds to show all markers
  if (locations.length > 0 || userLocation) {
    const bounds = new mapboxgl.LngLatBounds();
    
    if (userLocation) {
      bounds.extend([userLocation.lng, userLocation.lat]);
    }
    
    locations.forEach(location => {
      bounds.extend([location.lng, location.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }
}, [locations, userLocation, mapLoaded, mode]);
  
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
