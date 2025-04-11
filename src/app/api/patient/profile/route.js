// app/api/patient/profile/route.js
import { connectToDatabase } from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Get the userId from the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the user profile
    const profile = await UserProfile.findOne({ user: userId });

    // Return the profile if found, or null if not
    return Response.json({
      profile: profile ? profile.toObject() : null,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Clean up empty arrays
    const cleanBody = {
      ...body,
      medicalHistory: body.medicalHistory.filter((item) => item.trim() !== ""),
      allergies: body.allergies.filter((item) => item.trim() !== ""),
      currentMedications: body.currentMedications.filter(
        (item) => item.trim() !== ""
      ),
    };

    const existing = await UserProfile.findOne({ user: body.user });

    if (existing) {
      // Update existing profile
      await UserProfile.findOneAndUpdate({ user: body.user }, cleanBody, {
        new: true,
      });
      return Response.json({ message: "Profile updated successfully" });
    }

    // Create new profile
    await UserProfile.create(cleanBody);
    return Response.json({ message: "Profile created successfully" });
  } catch (err) {
    console.error("Error saving profile:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
