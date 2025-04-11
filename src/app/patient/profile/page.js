"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  PencilIcon,
  CheckIcon,
  XIcon,
  UserCircle,
  Save,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PatientProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        router.push("/patient/dashboard");
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
              className="p-1 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-200"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          )
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
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
              className="p-1 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-200"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            {formData[field].map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleArrayChange(field, e.target.value, index)
                  }
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={`Add ${label.toLowerCase()}`}
                />
                {formData[field].length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(field, index)}
                    className="ml-2 p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                  >
                    <XIcon size={14} />
                  </button>
                )}
                {index === formData[field].length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem(field)}
                    className="ml-2 p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                  >
                    <CheckIcon size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            {formData[field].filter((item) => item.trim() !== "").length > 0 ? (
              <ul className="list-disc pl-5">
                {formData[field]
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
              </ul>
            ) : (
              <span className="text-gray-500">None provided</span>
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
      <div className="mb-6 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center">
            {section === "address" && <MapPin className="mr-2 h-5 w-5" />}
            {section === "emergencyContact" && (
              <Phone className="mr-2 h-5 w-5" />
            )}
            {title}
          </h3>
          {formData._id && (
            <button
              type="button"
              onClick={() => toggleEditMode(section)}
              className="p-1.5 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-200"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(([key, label]) => (
            <div key={key} className="mb-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id={`${section}.${key}`}
                  value={formData[section][key]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center">
          <UserCircle className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {formData._id ? "Medical Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-gray-600">
              {formData._id
                ? "Your health information is kept secure and used to provide better care"
                : "Please provide your medical information for better emergency care"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            Personal Information
          </h3>

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
        </div>

        {/* Address Section */}
        {renderSection("Address Information", "address", [
          ["street", "Street Address"],
          ["city", "City"],
          ["state", "State/Province"],
          ["zip", "Postal/ZIP Code"],
          ["country", "Country"],
        ])}

        {/* Emergency Contact Section */}
        {renderSection("Emergency Contact", "emergencyContact", [
          ["name", "Contact Name"],
          ["relation", "Relationship"],
          ["phone", "Contact Number"],
        ])}

        {/* Medical Information */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Medical Information
          </h3>

          <div className="space-y-5">
            {renderArrayField("Medical History", "medicalHistory")}
            {renderArrayField("Allergies", "allergies")}
            {renderArrayField("Current Medications", "currentMedications")}
          </div>
        </div>

        {/* Insurance Information */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Insurance Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField("Insurance Provider", "insuranceProvider")}
            {renderField("Insurance Number", "insuranceNumber")}
          </div>
        </div>

        {/* Note about information security */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Your medical information is encrypted and securely stored. It will
            only be accessed by authorized medical professionals in case of
            emergency.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`
              px-6 py-3 rounded-lg text-white font-medium 
              ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md"
              } 
              transition-all duration-300 flex items-center
            `}
          >
            {saving ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {formData._id ? "Save Changes" : "Create Profile"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Icons needed to render the profile page
const MapPin = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
};

const Phone = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
};

const Shield = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
};

const Activity = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
};
