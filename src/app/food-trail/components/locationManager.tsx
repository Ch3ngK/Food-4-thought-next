'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';
import { FoodLocation } from '../types';
import LocationComponent from './locationComponent';
import LocationInput from './locationInput';
import './food-trail-table.css'; // Adjust path as needed

export default function LocationManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<FoodLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const allLocations = searchParams.getAll('location');

  // Toggle visited (placeholder)
/*  const handleToggleLocation = (_loc: FoodLocation, _index: number) => {
    alert('Toggling visited status is not implemented yet.');
  }; */

  useEffect(() => {
    const fetchLocations = async () => {
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
      setLoading(false);
    };

    fetchLocations();
  }, []);

  const handleAddLocation = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('food_trail_locations')
      .insert([{ title, user_id: user.id }])
      .select();

    if (error) console.error(error);
    else setLocations(prev => [...prev, data[0]]);
  };

  const handleToggleLocation = async (food_trail_id: number, visited: boolean) => {
    const { error } = await supabase
      .from('food_trail_locations')
      .update({ visited })
      .eq('food_trail_id', food_trail_id);

    if (error) console.error(error);
    else setLocations(prev => 
      prev.map(loc => loc.food_trail_id === food_trail_id ? { ...loc, visited } : loc)
    );
  };


  const handleDeleteLocation = async (id: number) => {
    const { error } = await supabase
      .from('food_trail_locations')
      .delete()
      .eq('food_trail_id', id);

    if (error) console.error(error);
    else setLocations(prev => prev.filter(loc => loc.food_trail_id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <LocationInput onAdd={handleAddLocation} />
      <table className= "food-trail-table">
        <thead>
          <tr>
          <th className='a'>#</th>
            <th className='Location'>Location</th>
            <th className='Visited'>Visited</th>
            <th className='Action'>Action</th>
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
