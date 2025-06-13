'use client';

import { useRouter, useSearchParams } from 'next/navigation';
//import { FoodLocation } from '../types';
import LocationComponent from './locationComponent';
import LocationInput from './locationInput';
import './food-trail-table.css'; // Adjust path as needed

export default function LocationManager() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const allLocations = searchParams.getAll('location');
  const locations = allLocations.map((title) => ({ title, visited: false }));

  // Toggle visited (placeholder)
/*  const handleToggleLocation = (_loc: FoodLocation, _index: number) => {
    alert('Toggling visited status is not implemented yet.');
  }; */

  const handleDeleteLocation = (index: number) => {
    const updatedParams = new URLSearchParams(searchParams.toString());
    const updatedLocations = allLocations.filter((_, i) => i !== index);
    updatedParams.delete('location');
    updatedLocations.forEach((loc) => updatedParams.append('location', loc));
    router.push(`/food-trail?${updatedParams.toString()}`);
  };

  return (
    <div>
      <LocationInput />
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
              title={location.title}
              visited={location.visited}
              handleDelete={() => handleDeleteLocation(index)}
            />
          ))}
        </tbody>
      </table>
      <button
        onClick={() => router.push(`/food-trail/Foodtrailmap?${searchParams.toString()}`)}
        className="view-map-button"
      >
        View Map
      </button>
    </div>
  );
}
