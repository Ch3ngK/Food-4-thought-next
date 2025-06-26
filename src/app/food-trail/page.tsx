import { Suspense } from 'react';
import FoodTrailClient from './FoodTrailClient';
import './FoodTrail.css';
import 'leaflet/dist/leaflet.css';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading trail...</div>}>
      <FoodTrailClient />
    </Suspense>
  );
}
