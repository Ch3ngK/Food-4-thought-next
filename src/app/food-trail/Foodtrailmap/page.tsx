'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./FoodTrailMap'), {
  ssr: false,
});

export default function FoodTrailMapPage() {
  return <DynamicMap />;
}