//import { useRouter, useSearchParams } from "next/navigation";
//import { useEffect } from "react";
import Header from "./components/header";
import LocationManager from "./components/locationManager";
//import LocationInput from './components/locationInput';
//import { FoodLocation } from "./types";
import "./FoodTrail.css"; 

export default function FoodTrail() {
  
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
