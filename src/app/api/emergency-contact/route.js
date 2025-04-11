// app/api/emergency-contact/route.js
import { NextResponse } from "next/server";
import  { connectToDatabase } from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import mongoose from "mongoose";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const profile = await UserProfile.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (
      !profile ||
      !profile.emergencyContact ||
      !profile.emergencyContact.phone
    ) {
      return NextResponse.json(
        { message: "Emergency contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      emergencyContact: {
        phone: profile.emergencyContact.phone,
        name: profile.emergencyContact.name,
        relation: profile.emergencyContact.relation,
      },
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
