"use client";
import { useState, useEffect } from "react";

const SOSSection = ({ userId }) => {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userCredentials, setUserCredentials] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          fetch(`/api/emergency-contact?userId=${userId}`).then((res) =>
            res.json()
          ),
          fetch(`/api/patient/profile?userId=${userId}`).then((res) =>
            res.json()
          ),
          fetch(`/api/user/credentials?userId=${userId}`).then((res) =>
            res.json()
          ),
        ];

        const [contactData, profileData, credentialsData] = await Promise.all(
          promises
        );

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

    const firstName = userCredentials?.firstName || "Unknown";
    const lastName = userCredentials?.lastName || "";

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

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      profileLines
    )}`;

    return qrCodeUrl;
  };

  const initiateEmergencyCall = async (location) => {
    try {
      setIsCallingEmergency(true);

      const res = await fetch("/api/sos-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: emergencyContact?.phone || "09513886363",
          userName: `${userCredentials?.firstName} ${userCredentials?.lastName}`,
          location: location,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(
        "Emergency services have been notified. Stay calm, help is on the way."
      );
    } catch (error) {
      console.error("Emergency call failed:", error);
      alert(
        "Failed to contact emergency services. Please try again or call directly."
      );
    } finally {
      setIsCallingEmergency(false);
    }
  };

  const sendSOS = async () => {
    try {
      const pos = await getCurrentLocation();
      const { latitude, longitude } = pos.coords;
      const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      await initiateEmergencyCall(locationLink);

      const name = userCredentials
        ? `${userCredentials.firstName} ${userCredentials.lastName}`
        : "A patient";

      const qrCodeUrl = await generateProfileQRCode();

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
          disabled={isCallingEmergency}
          className={`
            w-full bg-red-500 hover:bg-red-700 text-white font-bold 
            py-3 px-6 rounded-lg shadow transition-colors
            ${isCallingEmergency ? "opacity-75 cursor-not-allowed" : ""}
          `}
        >
          {isCallingEmergency ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Contacting Emergency Services...
            </div>
          ) : (
            "Send SOS with Emergency Call"
          )}
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
};

export default SOSSection;
