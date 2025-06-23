'use client';

import { useSearchParams } from 'next/navigation';
import FoodStart from './FoodStart';
import FoodTrail from './FoodTrail';
import './FoodTrail.css'
import 'leaflet/dist/leaflet.css';


export default function FoodTrailPage() {
    const searchParams = useSearchParams();
    return <FoodStart />;
  }