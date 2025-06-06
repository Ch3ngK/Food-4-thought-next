'use client';

import { useSearchParams } from 'next/navigation';
import FoodStart from './FoodStart';
import FoodTrail from './FoodTrail';
import './FoodTrail.css'

export default function FoodTrailPage() {
    const searchParams = useSearchParams();
    const hasLocations = searchParams.getAll('location').length > 0;
  
    return hasLocations ? <FoodTrail /> : <FoodStart />;
  }