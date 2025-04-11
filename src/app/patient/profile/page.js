"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function PatientProfileForm() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    contactNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    medicalHistory: [""],
    allergies: [""],
    currentMedications: [""],
    insuranceProvider: "",
    insuranceNumber: "",
  });

  // Fetch existing profile data when component mounts
  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/patient/profile?userId=${session.user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              // Format date to YYYY-MM-DD for input[type="date"]
              const formattedData = {
                ...data.profile,
                dateOfBirth: data.profile.dateOfBirth
                  ? new Date(data.profile.dateOfBirth)
                      .toISOString()
                      .split("T")[0]
                  : "",
              };

              // Ensure arrays have at least one empty string if they're empty
              const ensureArrayWithValue = (arr = []) =>
                arr.length ? arr : [""];

              setFormData({
                ...formattedData,
                medicalHistory: ensureArrayWithValue(
                  formattedData.medicalHistory
                ),
                allergies: ensureArrayWithValue(formattedData.allergies),
                currentMedications: ensureArrayWithValue(
                  formattedData.currentMedications
                ),
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (status !== "loading") {
      fetchProfile();
    }
  }, [session, status]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id.includes(".")) {
      const [section, key] = id.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleArrayChange = (field, value, index = 0) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("User not logged in");

    try {
      const res = await fetch("/api/patient/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user: session.user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Profile saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (status === "loading" || loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {formData._id ? "Update Patient Profile" : "Create Patient Profile"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Date of Birth:
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block">
          Gender:
          <select
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>

        <label className="block">
          Blood Group:
          <select
            id="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          >
            <option value="">Select</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="block">
          Contact Number:
          <input
            type="text"
            id="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <h3 className="text-lg font-semibold mt-4">Address</h3>
        {["street", "city", "state", "zip", "country"].map((f) => (
          <label key={f} className="block">
            {f.charAt(0).toUpperCase() + f.slice(1)}:
            <input
              id={`address.${f}`}
              value={formData.address[f]}
              onChange={handleChange}
              className="input w-full mt-1 p-2 border rounded"
            />
          </label>
        ))}

        <h3 className="text-lg font-semibold mt-4">Emergency Contact</h3>
        {Object.entries({
          name: "Name",
          phone: "Phone Number",
          relation: "Relationship",
        }).map(([key, label]) => (
          <label key={key} className="block">
            {label}:
            <input
              id={`emergencyContact.${key}`}
              value={formData.emergencyContact[key]}
              onChange={handleChange}
              className="input w-full mt-1 p-2 border rounded"
            />
          </label>
        ))}

        <label className="block">
          Medical History:
          <input
            type="text"
            value={formData.medicalHistory[0] || ""}
            onChange={(e) =>
              handleArrayChange("medicalHistory", e.target.value)
            }
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block">
          Allergies:
          <input
            type="text"
            value={formData.allergies[0] || ""}
            onChange={(e) => handleArrayChange("allergies", e.target.value)}
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block">
          Current Medications:
          <input
            type="text"
            value={formData.currentMedications[0] || ""}
            onChange={(e) =>
              handleArrayChange("currentMedications", e.target.value)
            }
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block">
          Insurance Provider:
          <input
            type="text"
            id="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block">
          Insurance Number:
          <input
            type="text"
            id="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleChange}
            className="input w-full mt-1 p-2 border rounded"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {formData._id ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
