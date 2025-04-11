"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function PatientProfileForm() {
  const { data: session, status } = useSession();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("User not logged in");

    const res = await fetch("/api/patient/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, user: session.user.id }),
    });

    const data = await res.json();
    alert(data.message || "Profile saved!");
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Patient Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Date of Birth:
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="input"
          />
        </label>

        <label className="block">
          Gender:
          <select
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input"
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
            className="input"
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
            className="input"
          />
        </label>

        <h3 className="text-lg font-semibold mt-4">Address</h3>
        {["street", "city", "state", "zip", "country"].map((f) => (
          <input
            key={f}
            id={`address.${f}`}
            placeholder={f}
            value={formData.address[f]}
            onChange={handleChange}
            className="input"
          />
        ))}

        <h3 className="text-lg font-semibold mt-4">Emergency Contact</h3>
        {["name", "phone", "relation"].map((f) => (
          <input
            key={f}
            id={`emergencyContact.${f}`}
            placeholder={f}
            value={formData.emergencyContact[f]}
            onChange={handleChange}
            className="input"
          />
        ))}

        <label className="block">
          Medical History:
          <input
            type="text"
            value={formData.medicalHistory[0]}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                medicalHistory: [e.target.value],
              }))
            }
            className="input"
          />
        </label>

        <label className="block">
          Allergies:
          <input
            type="text"
            value={formData.allergies[0]}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                allergies: [e.target.value],
              }))
            }
            className="input"
          />
        </label>

        <label className="block">
          Current Medications:
          <input
            type="text"
            value={formData.currentMedications[0]}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                currentMedications: [e.target.value],
              }))
            }
            className="input"
          />
        </label>

        <label className="block">
          Insurance Provider:
          <input
            type="text"
            id="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleChange}
            className="input"
          />
        </label>

        <label className="block">
          Insurance Number:
          <input
            type="text"
            id="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleChange}
            className="input"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
