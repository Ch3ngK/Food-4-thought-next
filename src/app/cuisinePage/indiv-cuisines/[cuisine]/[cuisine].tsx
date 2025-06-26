
'use client';

import React from 'react';
import Link from 'next/link';
import '../cuisineStyles.css';
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { supabase } from '@/app/supabaseClient';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import './[cuisine].css'

interface FoodPlace {
    name: string;
    description: string;
    id: number;
}  

interface NewFoodPlace {
  name: string;
  description: string;
  image1: File | null;
  image2: File | null;
  mapImage: File | null;
}

function DiffCuisines() {
    const params = useParams();
    const cuisineName = decodeURIComponent(params.cuisine as string);

    const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPlace, setNewPlace] = useState<NewFoodPlace>({
      name: '',
      description: '',
      image1: null,
      image2: null,
      mapImage: null
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewPlace(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof NewFoodPlace) => {
      if (e.target.files && e.target.files[0]) {
        setNewPlace(prev => ({ ...prev, [field]: e.target.files![0] }));
      }
    };

    const validateImage = (file:File | null) => {
      if (!file) return false;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cuisineName || isUploading) return;

      if (!newPlace.name || !newPlace.description) {
        alert("Please fill i all required fields");
        return;
      }

      if (!newPlace.image1 || !newPlace.mapImage) {
        alert("Please upload both the main image and map screenshot");
        return;
      }

      if (!validateImage(newPlace.image1) || !validateImage(newPlace.mapImage)) {
        alert("Please upload valid images (JPEG/PNG/WEBP under 5MB)");
        return;
      }

      setIsUploading(true);
    
      try {

        const {data: sessionData } = await supabase.auth.getSession();
        console.log("Session:", sessionData);
        // get cuisine id
        const { data: cuisineData } = await supabase
          .from('cuisines')
          .select('cuisine_id')
          .eq('cuisine_name', cuisineName)
          .single();
    
        if (!cuisineData) throw new Error('Cuisine not found');
    
        // upload images to storage
        const uploadImage = async (file: File, prefix: string) => {
          const timestamp = Date.now();
          const uniqueFilename = `${prefix}_${timestamp}_${file.name.replace(/\s+/g, '_')}`; // replace spaces with underscores
          const { data, error } = await supabase.storage
            .from('pictures')
            .upload(uniqueFilename, file, {
              cacheControl: '3600',
              upsert: false
            });
        
          if (error) throw error;
          return uniqueFilename;
        };
    
        const [image1Path, image2Path, mapImagePath] = await Promise.all([
          uploadImage(newPlace.image1, 'main'),
          newPlace.image2 ? uploadImage(newPlace.image2, 'secondary') : Promise.resolve(null),
          uploadImage(newPlace.mapImage, 'map')
        ]);
    
        // insert food place record
        const { data: placeData, error } = await supabase
          .from('food_places')
          .insert([{
            food_places_name: newPlace.name,
            food_places_description: newPlace.description,
            image_1: image1Path,
            image_2: image2Path,
            map_image: mapImagePath,
            cuisine_id: cuisineData.cuisine_id
          }])
          .select();
    
        if (error) throw error;
    
        // update local state
        setFoodPlaces(prev => [...prev, {
          id: placeData[0].food_places_id,
          name: placeData[0].food_places_name,
          description: placeData[0].food_places_description
        }]);
    
        // reset the form
        setNewPlace({
          name: '',
          description: '',
          image1: null,
          image2: null,
          mapImage: null
        });
        setShowAddForm(false);
    
      } catch (error) {
        console.error('Full error:',JSON.stringify(error, null, 2));
      } finally {
        setIsUploading(false);
      }
    };

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

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="add-place-button"
              >
                {showAddForm ? 'Cancel' : '+ Add New Food Place'}
              </button>

      {/* Add Food Place Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-place-form">
          <strong className="title-head">Add New Food Place</strong>
          
          <div className="form-group">
            <label>Place Name</label>
            <Input
              placeholder='Type the name of the place...'
              type="text"
              name="name"
              value={newPlace.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <Textarea
              placeholder="Type your description here..."
              name="description"
              value={newPlace.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Main Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image1')}
              required
            />
          </div>

          <div className="form-group">
            <label>Secondary Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image2')}
            />
          </div>

          <div className="form-group">
            <label>Map Screenshot</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'mapImage')}
              required
            />
          </div>

          <button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Add Place'}
          </button>
        </form>
      )}

              <Link href='../../cuisinePage' className="back-home-button">Back to Cuisines</Link>
            </div>
          </div>
        </div>
      );
    }
    
    export default DiffCuisines;