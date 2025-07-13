'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';
import { Search, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import './allfoodtrails.css';

const LogoUrl = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/Food4Thought.png';

interface Trail {
  id: number;
  slug: string;
  name: string;
  description: string;
  description2: string;
  duration: string;
  stops: number;
  rating: number;
  imageUrl: string;
  created_at: string;
  destinations: string;
}

export default function AllFoodTrailsComponent() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchTrails = async () => {
      const { data, error } = await supabase
        .from('food_trails')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setTrails(data || []);
      setIsLoading(false);
    };
    fetchTrails();
  }, []);

  const filtered = trails.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
    || t.destinations.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="background-img-afts food-trails-loading">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  return (
  <div className="allfoodtrails">
    <div className="allfoodtrailsheader">Food trails</div>
    <div className="allfoodtrailsheader-2">Discover culinary adventures crafted by fellow food enthusiasts</div>
    <div className="background-img-afts"></div>
          <Image 
            id="Logo-afts" 
            src={LogoUrl} 
            alt="Food4Thought Logo" 
            width={200} 
            height={80} 
          />
    <div className="trails-page-container">
      <div className="search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search food trails..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="trails-grid">
        {filtered.map(trail => (
          <Link key={trail.slug} href={`/popular/food-trail-sharing/${trail.slug}`} className="trail-card">
            <img src={trail.imageUrl} alt={trail.name} />
            <div className="trail-info">
              <h3>{trail.name}</h3>
              <p className="trail-desc">{trail.description}</p>
              <div className="trail-meta">
                <MapPin size={14}/> {trail.destinations.split(',')[0]} &bull; <Clock size={14}/> {trail.duration}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p>No trails found.</p>}
    </div>
    <Link href='.././popular' className="back-button-aft">Back to popular</Link>
  </div>
);

}

