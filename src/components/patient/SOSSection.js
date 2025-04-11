"use client";
import { useState, useEffect } from "react";

export default function SOSSection({ userId }) {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userCredentials, setUserCredentials] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create an array of promises for parallel fetching
        const promises = [
          // Fetch emergency contact
          fetch(`/api/emergency-contact?userId=${userId}`).then((res) =>
            res.json()
          ),
          // Fetch user profile
          fetch(`/api/patient/profile?userId=${userId}`).then((res) =>
            res.json()
          ),
          // Fetch user credentials for name
          fetch(`/api/user/credentials?userId=${userId}`).then((res) =>
            res.json()
          ),
        ];

        // Wait for all promises to resolve
        const [contactData, profileData, credentialsData] = await Promise.all(
          promises
        );

        // Check and set data
        if (contactData.error)
          throw new Error(contactData.message || contactData.error);
        setEmergencyContact(contactData.emergencyContact);

        if (profileData.error) throw new Error(profileData.error);
        setUserProfile(profileData.profile);

        if (credentialsData.error) throw new Error(credentialsData.error);
        setUserCredentials(credentialsData.user);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, (err) =>
        reject("Failed to get location.")
      );
    });
  };

  const generateProfileQRCode = async () => {
    if (!userProfile) return null;

    // Get user's name from credentials
    const firstName = userCredentials?.firstName || "Unknown";
    const lastName = userCredentials?.lastName || "";

    // Format profile data as colon-separated values - using correct property names from your data
    const profileLines = [
      `Name: ${firstName} ${lastName}`,
      `DOB: ${new Date(userProfile.dateOfBirth).toLocaleDateString() || "N/A"}`,
      `Blood Group: ${userProfile.bloodGroup || "N/A"}`,
      `Gender: ${userProfile.gender || "N/A"}`,
      `Contact: ${userProfile.contactNumber || "N/A"}`,
      `Emergency Contact: ${
        userProfile.emergencyContact?.name || emergencyContact?.name || "N/A"
      } (${
        userProfile.emergencyContact?.phone || emergencyContact?.phone || "N/A"
      })`,
      `Relation: ${userProfile.emergencyContact?.relation || "N/A"}`,
      `Allergies: ${userProfile.allergies?.join(", ") || "None"}`,
      `Medical History: ${userProfile.medicalHistory?.join(", ") || "None"}`,
      `Current Medications: ${
        userProfile.currentMedications?.join(", ") || "None"
      }`,
      `Insurance: ${userProfile.insuranceProvider || "N/A"} - ${
        userProfile.insuranceNumber || "N/A"
      }`,
      `Address: ${userProfile.address?.street || ""}, ${
        userProfile.address?.city || ""
      }, ${userProfile.address?.state || ""}, ${
        userProfile.address?.country || ""
      } ${userProfile.address?.zip || ""}`,
    ].join("\n");

    // Generate QR code URL using a free API service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      profileLines
    )}`;

    return qrCodeUrl;
  };

  const sendSOS = async () => {
    try {
      const pos = await getCurrentLocation();
      const { latitude, longitude } = pos.coords;
      const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Get user's name for the message
      const name = userCredentials
        ? `${userCredentials.firstName} ${userCredentials.lastName}`
        : "A patient";

      // Generate QR code with medical data
      const qrCodeUrl = await generateProfileQRCode();

      // Build message with name, location and QR code link
      let msg = `🚨 EMERGENCY! ${name} needs help. Location: ${locationLink}`;

      if (qrCodeUrl) {
        msg += `\n\nScan this QR code for medical information: ${qrCodeUrl}`;
      }

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${
        emergencyContact?.phone || userProfile?.emergencyContact?.phone
      }&text=${encodeURIComponent(msg)}`;

      window.open(whatsappUrl, "_blank");
    } catch (err) {
      setError(typeof err === "string" ? err : err.message);
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

  if (loading) return <p>Loading emergency information...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 w-full">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        🚨 SOS & Hospital Finder
      </h2>

      <div className="mb-4">
        <p className="text-sm mb-2">
          Pressing the SOS button will send your current location and medical
          profile QR code to your emergency contact via WhatsApp.
        </p>
        <button
          onClick={sendSOS}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow"
        >
          Send SOS with Medical Profile
        </button>
      </div>

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
