'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';
import { FoodLocation } from '../types';
import LocationComponent from './locationComponent';
import LocationInput from './locationInput';
import Header from './header';  // ✅ Correct import
import './food-trail-table.css';

export default function LocationManager() {
  const router = useRouter();
  const [locations, setLocations] = useState<FoodLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, visited: 0 });
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_trail_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      else {
        setLocations(data || []);
        if (!data || data.length === 0) {
          router.push('/food-trail');
        }
      }

      const { count } = await supabase
        .from('food_trail_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: visitedCount } = await supabase
        .from('food_trail_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('visited', true);

      setStats({
        total: count || 0,
        visited: visitedCount || 0,
      });

      const fetchedUsername = user.user_metadata?.username || user.email;
      setUsername(fetchedUsername);

      setLoading(false);
    };

    fetchAllData();
  }, []);

  const handleAddLocation = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('food_trail_locations')
      .insert([{ title, user_id: user.id }])
      .select();

    if (error) console.error(error);
    else {
      setLocations(prev => [...prev, data[0]]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleToggleLocation = async (food_trail_id: number, visited: boolean) => {
    const { error } = await supabase
      .from('food_trail_locations')
      .update({ visited })
      .eq('food_trail_id', food_trail_id);

    if (error) console.error(error);
    else {
      setLocations(prev =>
        prev.map(loc => loc.food_trail_id === food_trail_id ? { ...loc, visited } : loc)
      );
      setStats(prev => ({
        ...prev,
        visited: visited ? prev.visited + 1 : prev.visited - 1,
      }));
    }
  };

  const handleDeleteLocation = async (id: number) => {
    const toDelete = locations.find(loc => loc.food_trail_id === id);
    const wasVisited = toDelete?.visited || false;

    const { error } = await supabase
      .from('food_trail_locations')
      .delete()
      .eq('food_trail_id', id);

    if (error) console.error(error);
    else {
      setLocations(prev => prev.filter(loc => loc.food_trail_id !== id));
      setStats(prev => ({
        total: prev.total - 1,
        visited: wasVisited ? prev.visited - 1 : prev.visited,
      }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Header stats={stats} username={username} />
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
          {locations.map((location, index) => (
            <LocationComponent
              key={index}
              index={index}
              location={location}
              onToggle={handleToggleLocation}
              onDelete={handleDeleteLocation}
            />
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          const params = new URLSearchParams();
          locations.forEach(loc => params.append('location', loc.title));
          router.push(`/food-trail/Foodtrailmap?${params.toString()}`);
        }}
        className="view-map-button"
      >
        View Map
      </button>
    </div>
  );
}
