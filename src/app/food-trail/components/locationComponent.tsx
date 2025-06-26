'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { FoodLocation } from '../types'

export default function LocationComponent({
  index,
  location,
  onToggle,
  onDelete,
}: {
  index: number;
  location: FoodLocation;
  onToggle: (food_trail_id: number, visited: boolean) => void;
  onDelete: (food_trail_id: number) => void;
}) {
  return (
    <tr>
      <td className ="px-a py-2">{index + 1}</td>
      <td>{location.title}</td>
      <td>
        <Checkbox
          checked={location.visited}
          onCheckedChange={(checked) => onToggle(location.food_trail_id, checked as boolean)}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td>
        <button onClick={() => onDelete(location.food_trail_id)} className = 'delete-button'>Delete</button>
      </td>
    </tr>
  );
}

