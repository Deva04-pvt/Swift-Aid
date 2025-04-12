"use client";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
} from "lucide-react";

export default function SOSSection({ userId }) {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userCredentials, setUserCredentials] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create an array of promises for parallel fetching
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

    // Format profile data as colon-separated values
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
    if (sending) return;

    try {
      setSending(true);

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
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-400" />
        <p className="mt-2 text-gray-300">Loading emergency information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-600">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const contactName =
    emergencyContact?.name || userProfile?.emergencyContact?.name;
  const contactPhone =
    emergencyContact?.phone || userProfile?.emergencyContact?.phone;

  return (
    <div className="w-full">
      {/* Emergency Contact Info */}
      {contactName && contactPhone && (
        <div className="flex items-center mb-5 bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-700">
          <div className="bg-red-900/30 rounded-full p-2 mr-3">
            <Phone className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{contactName}</p>
            <p className="text-xs text-gray-400">{contactPhone}</p>
          </div>
        </div>
      )}

      {/* SOS Button */}
      <div className="mb-6">
        <p className="text-sm mb-3 text-gray-300">
          Press the SOS button to alert your emergency contact with your current
          location and medical profile
        </p>
        <button
          onClick={sendSOS}
          disabled={sending}
          className={`
            relative w-full py-4 px-6 rounded-lg 
            flex items-center justify-center
            transition-all duration-300
            ${
              sending
                ? "bg-red-700 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
            }
            text-white font-bold
          `}
        >
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Sending Emergency Alert...</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>SEND SOS ALERT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
