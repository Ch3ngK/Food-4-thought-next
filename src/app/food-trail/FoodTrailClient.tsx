'use client';

import { useSearchParams } from 'next/navigation';
import FoodStart from './FoodStart';
import FoodTrail from './FoodTrail';

export default function FoodTrailClient() {
  const searchParams = useSearchParams();
  const showTrail = searchParams.get('showTrail');

  return showTrail === 'true' ? <FoodTrail /> : <FoodStart />;
}
