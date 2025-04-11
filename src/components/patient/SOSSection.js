"use client";
import { useState, useEffect } from "react";

export default function SOSSection({ userId }) {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`/api/emergency-contact?userId=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setEmergencyContact(data.emergencyContact);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchContact();
  }, [userId]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, (err) =>
        reject("Failed to get location.")
      );
    });
  };

  const sendSOS = async () => {
    try {
      const pos = await getCurrentLocation();
      const { latitude, longitude } = pos.coords;
      const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const msg = `🚨 Emergency! I need help. Here's my location: ${link}`;
      const url = `https://api.whatsapp.com/send?phone=${
        emergencyContact.phone
      }&text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckbox = (value, checked) => {
    setSelectedSpecialties((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const findHospitals = async () => {
    try {
      if (selectedSpecialties.length === 0) {
        alert("Select at least one hospital type.");
        return;
      }
      const pos = await getCurrentLocation();
      const query = `${selectedSpecialties.join(" OR ")} hospital near me`;
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
        query
      )}/@${pos.coords.latitude},${pos.coords.longitude},14z`;
      window.open(mapsUrl, "_blank");
    } catch (err) {
      alert("Failed to get location.");
    }
  };

  if (loading) return <p>Loading emergency contact...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 w-full">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        🚨 SOS & Hospital Finder
      </h2>

      <button
        onClick={sendSOS}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Send SOS
      </button>

      <div className="mt-6">
        <button
          onClick={() => setDropdownVisible(!dropdownVisible)}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {dropdownVisible ? "Hide Hospital Filters" : "Find Hospitals Nearby"}
        </button>

        {dropdownVisible && (
          <div className="mt-4 bg-gray-100 p-4 rounded">
            {[
              "Trauma Center",
              "Cardiac Hospital",
              "Stroke Center",
              "Burn Center",
              "Pediatric Emergency",
              "Maternity & Neonatal Emergency",
            ].map((label) => (
              <label key={label} className="block mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  value={label}
                  checked={selectedSpecialties.includes(label)}
                  onChange={(e) => handleCheckbox(label, e.target.checked)}
                />
                {label}
              </label>
            ))}
            <button
              onClick={findHospitals}
              className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 mt-4 rounded"
            >
              Search Hospitals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
