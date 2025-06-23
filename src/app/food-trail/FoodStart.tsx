// src/pages/FoodStart.tsx

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/app/supabaseClient';
import { Input } from '@/components/ui/input';
import Header from "./components/header";
import LocationManager from "./components/locationManager";
import "./FoodTrail.css";
import "./FoodStart.css";

export default function FoodTrailPage() {
  const [location, setLocation] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has any locations
    const checkLocations = async () => {
      const { count } = await supabase
        .from('food_trail_locations')
        .select('*', { count: 'exact', head: true });
      setHasStarted((count || 0) > 0);
    };
    checkLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    try {
      // check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      // insert first location
      const { error } = await supabase
        .from('food_trail_locations')
        .insert([{ 
          title: location, 
          user_id: user.id,
          visited: false 
        }]);

      if (error) throw error;

      // transition to trail view
      setHasStarted(true);
      router.refresh();

    } catch (error) {
      console.error("Error adding location:", error);
      alert("Failed to add location");
    }
  };

  // Render start screen
  if (!hasStarted) {
    return (
      <div className="background-img-4">
        <div className="dark-overlay"></div>
        <div className="text-box-4">
          <div className="welcome-food-trail">Welcome to the Food Trail! 🍔🍝</div>
          <br />
          <div className="add-food-location">Add a Food Location below to start</div>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <Input
              className="location-input"
              type="text"
              placeholder="e.g. Maxwell Food Centre"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button className="add-button" type="submit">
              Add
            </button>
          </form>
          <button 
            className="back-home-button"
            onClick={() => router.push('/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Render main trail view
  return (
    <div className="background-img-5">
      <div className="dark-overlay"></div>
      <div className="text-box-5">
      <Header />
        <main>
          <LocationManager />
        </main>
      </div>
    </div>
  );
}