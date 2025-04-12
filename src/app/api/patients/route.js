import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/UserCredentials";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Fetch all users with the role "Patient"
    const patients = await User.find({ role: "Patient" }).select(
      "firstName lastName email contactNumber"
    );

    return new Response(JSON.stringify({ patients }), { status: 200 });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch patients" }), {
      status: 500,
    });
  }
}