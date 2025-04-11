import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    dateOfBirth: { type: Date, required: false },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    contactNumber: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
    medicalHistory: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
    insuranceProvider: { type: String, default: "" },
    insuranceNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);
