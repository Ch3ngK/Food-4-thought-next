'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient'; // adjust the path as needed
import './food-trail-sharing.css';

interface Trail {
  slug: string;
  name: string;
  description: string;
  description2: string; 
  imageUrl: string;
  duration: string;
  stops: number;
  rating: number;
  destinations: string;
}

export default function FoodTrailSharing() {
  const params = useParams();
  const trailID = params.trailID as string;

  const [trail, setTrail] = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trailID) return;

    async function fetchTrail() {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_trails')
        .select('*')
        .eq('slug', trailID)
        .single();


      if (error) {
        setError('Trail not found or error fetching data.');
        setTrail(null);
      } else {
        setTrail(data);
        setError(null);
      }
      setLoading(false);
    }

    fetchTrail();
  }, [trailID]);

  if (loading) return <div>Loading trail data...</div>;
  if (error) return <div>{error}</div>;
  if (!trail) return <div>Trail not found.</div>;

  return (
    <div className="food-trail-sharing">
      <div className="background-img-food-trail"></div>
      <div className="logo-wrapper">
        <Image
          src="https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/Food4Thought.png"
          alt="Food Trail Logo"
          width={180}
          height={180}
          priority={true}
        />
      </div>
      <div className="food-trail-sharing-container">
        <h1 className="title">{trail.name}</h1>
        <p className="subtitle">{trail.description}</p>
        <Image 
          className="trail-image"
          src={trail.imageUrl}
          alt={trail.name}
          width={400}
          height={300}
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <div className="trail-details">
          <div className="duration"><strong>Duration:</strong> {trail.duration}</div>
          <div className="stops"><strong>Stops:</strong> {trail.stops}</div>
          <div className="rating"><strong>Rating:</strong> {trail.rating}</div>
          <div className="subtitle">{trail.description2}</div>
          <div className='destinations-header'>Destinations:</div>
          <div className="destinations">{trail.destinations}</div>
        </div>
        <br></br>
        <Link
          href={{
            pathname: '/food-trail/Foodtrailmap',
            query: { locations: trail.destinations.split(',').map(loc => loc.trim()).join(',') },
          }}
          className="map-button"
        >
          View Trail Map
        </Link>
        <br></br>
        <Link href="/share-trail" className="share-button">
          Share This Trail
        </Link>
      </div>
      <div className="button-container">
      <Link href="/popular" className="back-button-fts"> 
        Back to popular page
      </Link>
      </div>
    </div>
  );
}
