import LocationManager from "./components/locationManager";
import "./FoodTrail.css"; 

export default function FoodTrail() {
  return (
    <div className="background-img-5">
      <div className="dark-overlay"></div>
      <div className="text-box-5">
        <main>
          <LocationManager />
        </main>
      </div>
    </div>
  );
}
