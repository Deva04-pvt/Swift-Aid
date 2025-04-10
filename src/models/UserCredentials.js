// models/UserCredentials.js
import mongoose from "mongoose";

const UserCredentialsSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Doctor", "Patient"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Prevent model overwrite in development
export default mongoose.models.UserCredentials ||
  mongoose.model("UserCredentials", UserCredentialsSchema);
