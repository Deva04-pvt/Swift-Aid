"use client";
import { useState } from "react";

const hospitalTypes = [
  "Trauma Center",
  "Cardiac Hospital",
  "Stroke Center",
  "Burn Center",
  "Pediatric Emergency",
  "Maternity & Neonatal Emergency",
];

export default function HospitalSearch() {
  const [status, setStatus] = useState("");

  const findHospitals = (specialties = []) => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    if (specialties.length === 0) {
      setStatus("Please select at least one hospital type.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const searchQuery = specialties.join(" OR ") + " hospital near me";
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
          searchQuery
        )}/@${userLat},${userLng},14z`;

        window.open(mapsUrl, "_blank");
      },
      (error) => {
        setStatus("Error getting location: " + error.message);
      }
    );
  };

  return (
    <div className="bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto my-6">
      <h3 className="text-xl font-bold mb-4 text-center">
        🧭 Find Nearby Hospitals
      </h3>
      <p className="mb-2 font-medium">Choose types:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {hospitalTypes.map((type) => (
          <label key={type} className="flex items-center">
            <input
              type="checkbox"
              name="specialty"
              value={type}
              className="mr-2"
            />
            {type}
          </label>
        ))}
      </div>

      <button
        className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition mb-3"
        onClick={() => {
          const checkboxes = document.querySelectorAll(
            "input[name='specialty']:checked"
          );
          const selectedSpecialties = Array.from(checkboxes).map(
            (cb) => cb.value
          );
          findHospitals(selectedSpecialties);
        }}
      >
        Search Nearby Hospitals
      </button>
      <p className="text-red-600 text-sm mt-2 text-center">{status}</p>
    </div>
  );
}
