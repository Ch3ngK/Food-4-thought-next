// src/pages/FoodStart.tsx

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./FoodStart.css"; 

function FoodStart() {
  const [location, setLocation] = useState("");
  const route = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    // Pass the location as a query param
    route.push(`/food-trail?location=${encodeURIComponent(location)}`);
  };

  const handleBackHome = () => {
    route.push('/home');
  }

  return (
  <div className="background-img-4">
  <div className="dark-overlay"></div>
  <div className="text-box-4">
    <div className="welcome-food-trail">Welcome to the Food Trail! 🍔🍝</div>
    <br></br>
    <div className="add-food-location">Add a Food Location below to start</div>
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <input
        className="location-input"
        type="text"
        placeholder="e.g. Maxwell Food Centre"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          width: "250px",
          marginRight: "1rem",
        }}
        required
      />
      <button className="add-button" type="submit">Add</button>
    </form>
    <button
      className="back-home-button"
      type="submit"
      style={{
        marginTop: '1rem',
        padding: '0.5rem 1 rem',
        fontSize: '1 rem',
      }}
      onClick={handleBackHome}>
      Back to Home
      </button>
  </div>
</div>
  );
}

export default FoodStart;
