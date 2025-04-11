"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

export default function PatientProfileForm() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [saving, setSaving] = useState(false);
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

              // If profile exists, start with all fields in view mode
              const initialEditMode = {};
              Object.keys(formattedData).forEach((key) => {
                if (
                  typeof formattedData[key] !== "object" ||
                  Array.isArray(formattedData[key])
                ) {
                  initialEditMode[key] = false;
                }
              });

              // Add nested object fields
              initialEditMode["address"] = false;
              initialEditMode["emergencyContact"] = false;

              setEditMode(initialEditMode);
            } else {
              // If no profile exists, start with all fields in edit mode
              setEditMode({
                dateOfBirth: true,
                gender: true,
                bloodGroup: true,
                contactNumber: true,
                address: true,
                emergencyContact: true,
                medicalHistory: true,
                allergies: true,
                currentMedications: true,
                insuranceProvider: true,
                insuranceNumber: true,
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

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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

  const handleAddArrayItem = (field) => {
    setFormData((prev) => {
      return {
        ...prev,
        [field]: [...prev[field], ""],
      };
    });
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray.length ? newArray : [""],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("User not logged in");

    try {
      setSaving(true);

      // Clean up empty values from arrays
      const cleanedData = {
        ...formData,
        medicalHistory: formData.medicalHistory.filter(
          (item) => item.trim() !== ""
        ),
        allergies: formData.allergies.filter((item) => item.trim() !== ""),
        currentMedications: formData.currentMedications.filter(
          (item) => item.trim() !== ""
        ),
      };

      const res = await fetch("/api/patient/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cleanedData, user: session.user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        // Set all fields to view mode after successful save
        const newEditMode = {};
        Object.keys(editMode).forEach((key) => {
          newEditMode[key] = false;
        });
        setEditMode(newEditMode);

        alert(data.message || "Profile saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Display a field in view or edit mode
  const renderField = (label, id, type = "text", options = null) => {
    const isEditing = editMode[id.split(".")[0]];
    const value = id.includes(".")
      ? formData[id.split(".")[0]][id.split(".")[1]]
      : formData[id];

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700" htmlFor={id}>
            {label}
          </label>
          {formData._id && (
            <button
              type="button"
              onClick={() => toggleEditMode(id.split(".")[0])}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>

        {isEditing ? (
          options ? (
            <select
              id={id}
              value={value}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              id={id}
              value={value}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )
        ) : (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
            {value || "Not provided"}
          </div>
        )}
      </div>
    );
  };

  // Render an array field (like medical history, allergies)
  const renderArrayField = (label, field) => {
    const isEditing = editMode[field];

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {formData._id && (
            <button
              type="button"
              onClick={() => toggleEditMode(field)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div>
            {formData[field].map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleArrayChange(field, e.target.value, index)
                  }
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData[field].length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(field, index)}
                    className="ml-2 p-1 text-red-600 hover:text-red-800"
                  >
                    <XIcon size={16} />
                  </button>
                )}
                {index === formData[field].length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem(field)}
                    className="ml-2 p-1 text-green-600 hover:text-green-800"
                  >
                    <CheckIcon size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
            {formData[field].filter((item) => item.trim() !== "").length > 0 ? (
              <ul className="list-disc pl-5">
                {formData[field]
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            ) : (
              "None provided"
            )}
          </div>
        )}
      </div>
    );
  };

  // Render a section of fields (like address)
  const renderSection = (title, section, fields) => {
    const isEditing = editMode[section];

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {formData._id && (
            <button
              type="button"
              onClick={() => toggleEditMode(section)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(([key, label]) => (
            <div key={key} className="mb-2">
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id={`${section}.${key}`}
                  value={formData[section][key]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="p-2 bg-white border border-gray-200 rounded-md">
                  {formData[section][key] || "Not provided"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-2xl font-bold">
            {formData._id ? "Patient Profile" : "Create Your Profile"}
          </h2>
          <p className="text-blue-100">
            {formData._id
              ? "Your medical information is kept secure and private"
              : "Please complete your profile information"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField("Date of Birth", "dateOfBirth", "date")}
            {renderField("Gender", "gender", "select", [
              "Male",
              "Female",
              "Other",
            ])}
            {renderField("Blood Group", "bloodGroup", "select", [
              "A+",
              "A-",
              "B+",
              "B-",
              "O+",
              "O-",
              "AB+",
              "AB-",
            ])}
            {renderField("Contact Number", "contactNumber")}
          </div>

          {renderSection("Address Information", "address", [
            ["street", "Street Address"],
            ["city", "City"],
            ["state", "State/Province"],
            ["zip", "Postal/ZIP Code"],
            ["country", "Country"],
          ])}

          {renderSection("Emergency Contact", "emergencyContact", [
            ["name", "Contact Name"],
            ["relation", "Relationship"],
            ["phone", "Contact Number"],
          ])}

          <div className="mt-6 grid grid-cols-1 gap-6">
            {renderArrayField("Medical History", "medicalHistory")}
            {renderArrayField("Allergies", "allergies")}
            {renderArrayField("Current Medications", "currentMedications")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {renderField("Insurance Provider", "insuranceProvider")}
            {renderField("Insurance Number", "insuranceNumber")}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-medium 
                ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} 
                transition-colors duration-300 flex items-center`}
            >
              {saving && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {formData._id ? "Save Changes" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
