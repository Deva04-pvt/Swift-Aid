import { connectToDatabase } from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const existing = await UserProfile.findOne({ user: body.user });

    if (existing) {
      await UserProfile.updateOne({ user: body.user }, body);
      return Response.json({ message: "Profile updated successfully" });
    }

    await UserProfile.create(body);
    return Response.json({ message: "Profile created successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
