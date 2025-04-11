// app/api/user/credentials/route.js
import { connectToDatabase } from "@/lib/mongodb";
import UserCredentials from "@/models/UserCredentials";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Get the userId from the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the user credentials (only fetch name fields for security)
    const user = await UserCredentials.findById(userId).select(
      "firstName lastName -_id"
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user credentials
    return Response.json({
      user: user.toObject(),
    });
  } catch (err) {
    console.error("Error fetching user credentials:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
