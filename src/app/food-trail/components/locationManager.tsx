'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useReducer, useRef } from 'react';
import * as React from 'react';
import { supabase } from '@/app/supabaseClient';
import { FoodLocation } from '../types';
import LocationComponent from './locationComponent';
import LocationInput from './locationInput';
import Header from './header';
import './food-trail-table.css';
import LoadingScreen from '../../../components/LoadingScreen';

// action types for useReducer
type LocationAction = 
  | { type: 'SET_INITIAL_DATA'; payload: { locations: FoodLocation[]; username: string; stats: { total: number; visited: number } } }
  | { type: 'ADD_LOCATION'; payload: FoodLocation }
  | { type: 'TOGGLE_LOCATION'; payload: { id: number; visited: boolean } }
  | { type: 'DELETE_LOCATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALL_VISITED'; payload: boolean };

interface LocationState {
  locations: FoodLocation[];
  loading: boolean;
  stats: { total: number; visited: number };
  username: string | null;
  allVisited: boolean;
}

const initialState: LocationState = {
  locations: [],
  loading: true,
  stats: { total: 0, visited: 0 },
  username: null,
  allVisited: false,
};

// reducer for managing complex state logic
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        locations: action.payload.locations,
        username: action.payload.username,
        stats: action.payload.stats,
        loading: false,
      };
    
    case 'ADD_LOCATION':
      return {
        ...state,
        locations: [...state.locations, action.payload],
        stats: { ...state.stats, total: state.stats.total + 1 },
      };
    
    case 'TOGGLE_LOCATION':
      const updatedLocations = state.locations.map(loc => 
        loc.food_trail_id === action.payload.id 
          ? { ...loc, visited: action.payload.visited } 
          : loc
      );
      return {
        ...state,
        locations: updatedLocations,
        stats: {
          ...state.stats,
          visited: action.payload.visited 
            ? state.stats.visited + 1 
            : state.stats.visited - 1,
        },
      };
    
    case 'DELETE_LOCATION':
      const locationToDelete = state.locations.find(loc => loc.food_trail_id === action.payload);
      const wasVisited = locationToDelete?.visited || false;
      const updatedLocationsAfterDelete = state.locations.filter(loc => loc.food_trail_id !== action.payload);
      
      return {
        ...state,
        locations: updatedLocationsAfterDelete,
        stats: {
          total: state.stats.total - 1,
          visited: wasVisited ? state.stats.visited - 1 : state.stats.visited,
        },
        allVisited: updatedLocationsAfterDelete.length === 0,
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ALL_VISITED':
      return { ...state, allVisited: action.payload };
    
    default:
      return state;
  }
}

export default function LocationManager() {
  const router = useRouter();
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // memorised check for all locations visited
  const shouldShowAllVisited = useMemo(() => {
    if (state.loading || state.locations.length === 0) return false;
    return state.locations.every(loc => loc.visited);
  }, [state.locations, state.loading]);

  // initialize data by using useRef to ensure it only runs once
  const initializeData = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // fetch all data in parallel so it is faster
      const [locationsResponse, totalCountResponse, visitedCountResponse] = await Promise.all([
        supabase
          .from('food_trail_locations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('food_trail_locations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('food_trail_locations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('visited', true)
      ]);

      if (locationsResponse.error) {
        console.error(locationsResponse.error);
        return;
      }

      const locations = locationsResponse.data || [];
      const stats = {
        total: totalCountResponse.count || 0,
        visited: visitedCountResponse.count || 0,
      };
      const username = user.user_metadata?.username || user.email;

      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: { locations, username, stats }
      });

      // handle the reloading logic for empty locations
      if (locations.length === 0) {
        dispatch({ type: 'SET_ALL_VISITED', payload: true });
        redirectTimeoutRef.current = setTimeout(() => {
          window.location.href = '/food-trail';
        }, 1500);
      }

    } catch (error) {
      console.error('Error initializing data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [router]);

  // initialize on mount
  if (!hasInitialized.current) {
    initializeData();
  }

  // handle body overflow based on loading state
  const handleBodyOverflow = useCallback((loading: boolean) => {
    document.body.style.overflow = loading ? 'hidden' : '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  
  if (state.loading) {
    handleBodyOverflow(true);
  } else {
    const cleanup = handleBodyOverflow(false);
  }

  const cleanupTimeout = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      cleanupTimeout();
    };
  }, [cleanupTimeout]);

  // event handlers with useCallback to prevent unnecessary re-renders
  const handleAddLocation = useCallback(async (title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_trail_locations')
        .insert([{ title, user_id: user.id }])
        .select();

      if (error) {
        console.error(error);
      } else if (data?.[0]) {
        dispatch({ type: 'ADD_LOCATION', payload: data[0] });
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  }, []);

  const handleToggleLocation = useCallback(async (food_trail_id: number, visited: boolean) => {
    try {
      const { error } = await supabase
        .from('food_trail_locations')
        .update({ visited })
        .eq('food_trail_id', food_trail_id);

      if (error) {
        console.error(error);
      } else {
        dispatch({ type: 'TOGGLE_LOCATION', payload: { id: food_trail_id, visited } });
      }
    } catch (error) {
      console.error('Error toggling location:', error);
    }
  }, []);

  const handleDeleteLocation = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('food_trail_locations')
        .delete()
        .eq('food_trail_id', id);

      if (error) {
        console.error(error);
      } else {
        dispatch({ type: 'DELETE_LOCATION', payload: id });
        
        // check if this was the last location and trigger redirect
        const remainingLocations = state.locations.filter(loc => loc.food_trail_id !== id);
        if (remainingLocations.length === 0) {
          // clear any existing timeout first
          if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
          }
          redirectTimeoutRef.current = setTimeout(() => {
            window.location.href = '/food-trail';
          }, 900);
        }
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  }, [state.locations]);

  const handleViewMap = useCallback(() => {
    const params = new URLSearchParams();
    state.locations.forEach(loc => params.append('location', loc.title));
    router.push(`/food-trail/Foodtrailmap?${params.toString()}`);
  }, [state.locations, router]);

  const locationComponents = useMemo(() => {
    return state.locations.map((location, index) => (
      <LocationComponent
        key={location.food_trail_id}
        index={index}
        location={location}
        onToggle={handleToggleLocation}
        onDelete={handleDeleteLocation}
      />
    ));
  }, [state.locations, handleToggleLocation, handleDeleteLocation]);


  if (state.loading) return <LoadingScreen />;

  if (state.allVisited) {
    return (
      <div className="all-visited-message" style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        fontSize: '1.5rem', 
        color: '#4caf50' 
      }}>
        🎉 All locations visited! Redirecting to start page...
      </div>
    );
  }

  return (
    <div>
      <Header stats={state.stats} username={state.username} />
      <LocationInput onAdd={handleAddLocation} />
      <table className="food-trail-table">
        <thead>
          <tr>
            <th className="a">#</th>
            <th className="Location">Location</th>
            <th className="Visited">Visited</th>
            <th className="Action">Action</th>
          </tr>
        </thead>
        <tbody>
          {locationComponents}
        </tbody>
      </table>
      <button
        onClick={handleViewMap}
        className="view-map-button"
      >
        View Map
      </button>
    </div>
  );
}