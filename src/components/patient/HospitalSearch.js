"use client";
import { useState } from "react";
import { MapPin, Search, AlertCircle } from "lucide-react";

const hospitalTypes = [
  {
    id: "trauma",
    name: "Trauma Center",
    icon: "🚑",
    description: "For severe injuries requiring immediate attention",
  },
  {
    id: "cardiac",
    name: "Cardiac Hospital",
    icon: "❤️",
    description: "Specialized in heart-related emergencies",
  },
  {
    id: "stroke",
    name: "Stroke Center",
    icon: "🧠",
    description: "Quick response for stroke symptoms",
  },
  {
    id: "burn",
    name: "Burn Center",
    icon: "🔥",
    description: "Specialized treatment for severe burns",
  },
  {
    id: "pediatric",
    name: "Pediatric Emergency",
    icon: "👶",
    description: "Emergency care for children",
  },
  {
    id: "maternity",
    name: "Maternity & Neonatal",
    icon: "👩‍🍼",
    description: "Pregnancy and newborn emergencies",
  },
];

export default function HospitalSearch() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleType = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const findHospitals = () => {
    // Reset status message
    setStatus("");

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    if (selectedTypes.length === 0) {
      setStatus("Please select at least one hospital type.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Get the names of selected hospital types
        const selectedNames = hospitalTypes
          .filter((type) => selectedTypes.includes(type.id))
          .map((type) => type.name);

        const searchQuery = selectedNames.join(" OR ") + " hospital near me";
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
          searchQuery
        )}/@${userLat},${userLng},14z`;

        window.open(mapsUrl, "_blank");
        setIsLoading(false);
      },
      (error) => {
        setStatus("Error getting location: " + error.message);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="w-full mx-auto">
      <div className="mb-5">
        <h3 className="text-lg font-medium text-gray-200 mb-3">
          Select hospital types you are looking for:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hospitalTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`
                cursor-pointer p-3 rounded-lg transition-all duration-300
                ${
                  selectedTypes.includes(type.id)
                    ? "bg-teal-900/30 border-2 border-teal-500 shadow-sm"
                    : "bg-gray-700 border border-gray-600 hover:border-teal-500"
                }
              `}
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">{type.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-200">{type.name}</h4>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          className={`
            w-full flex items-center justify-center gap-2
            py-3 px-6 rounded-lg transition-all duration-300
            ${
              isLoading
                ? "bg-teal-700 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 shadow hover:shadow-md"
            } 
            text-white font-medium
          `}
          onClick={findHospitals}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Finding hospitals...</span>
            </>
          ) : (
            <>
              <MapPin className="h-5 w-5" />
              <span>Find Nearby Hospitals</span>
            </>
          )}
        </button>

        {status && (
          <div className="mt-4 p-3 bg-red-900/20 border-l-4 border-red-600 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{status}</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-teal-900/20 border-l-4 border-teal-600 rounded-md">
          <p className="text-sm text-teal-300">
            <strong>Note:</strong> This will open Google Maps to show nearby
            hospitals matching your selected criteria.
          </p>
        </div>
      </div>
    </div>
  );
}
