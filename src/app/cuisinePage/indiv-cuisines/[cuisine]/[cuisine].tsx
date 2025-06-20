
'use client';

import React from 'react';
import Link from 'next/link';
import '../cuisineStyles.css';
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { supabase } from '@/app/supabaseClient';
import './[cuisine].css'

interface FoodPlace {
    name: string;
    description: string;
    id: number;
}  

function DiffCuisines() {
    const params = useParams();
    const cuisineName = decodeURIComponent(params.cuisine as string);

    const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        if (!cuisineName) return;
    
        const fetchFoodPlaces = async () => {
          try {
            // fetch the cuisine_id from the cuisines table
            const { data: cuisineData, error: cuisineError } = await supabase
              .from('cuisines')
              .select('cuisine_id')
              .eq('cuisine_name', cuisineName)
              .single();
    
            if (cuisineError || !cuisineData) {
              console.error('Error fetching cuisine:', cuisineError);
              return;
            }
    
            const cuisineId = cuisineData.cuisine_id;
    
            // fetch food places from the food_places table
            const { data: placesData, error: placesError } = await supabase
              .from('food_places')
              .select('food_places_id, food_places_name, food_places_description')
              .eq('cuisine_id', cuisineId);
    
            if (placesError) {
              console.error('Error fetching food places:', placesError);
              return;
            }
    
            // transform data to match existing shape
            const transformedData = (placesData || []).map((place) => ({
              id: place.food_places_id,
              name: place.food_places_name,
              description: place.food_places_description,
            }));
    
            setFoodPlaces(transformedData);
          } catch (error) {
            console.error('Unexpected error:', error);
          }
        };
    
        fetchFoodPlaces();
      }, [cuisineName]);
        const filteredPlaces = foodPlaces.filter((place) =>
                                        place.name.toLowerCase().includes(searchTerm.toLowerCase())
                                      );
      return (
        
        <div className="ChineseCuisine">
          <div className="background-img"></div>
          <div className="content-box">
            <h1 className="cuisine-title">
              <span className="orange-box">{cuisineName} Cuisine</span>
            </h1>
            <p className="cuisine-description">
              Explore the best hidden gems and local favorites serving authentic {cuisineName} cuisine.
            </p>
            <input
              type="text"
              placeholder="Search food place..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                maxWidth: '400px',
              }}
            />
        
            {/* Food Places Listing */}
            <div className="food-places-list">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place, index) => {
                  const cardContent = (
                    <div className="food-place-card">
                      <div className="food-place-header">
                        <span className="place-number">{index + 1}.</span>
                        <h2 className="food-place-name">{place.name}</h2>
                      </div>
                      <p className="food-place-description">{place.description}</p>
                    </div>
                  );
                 
                  return (
                    <Link
                      href={`/cuisinePage/indiv-cuisines/reviews/${place.id}`}
                      key={place.id}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {cardContent}
                    </Link>
                  );
                })
              ) : (
                <p style={{ fontStyle: 'italic', marginTop: '20px' }}>None found.</p>
              )}

              <Link href='../../cuisinePage' className="back-home-button">Back to Cuisines</Link>
            </div>
          </div>
        </div>
      );
    }
    
    export default DiffCuisines;