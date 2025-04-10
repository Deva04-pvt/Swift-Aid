// app/api/register/route.js
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/UserCredentials";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    return new Response(
      JSON.stringify({ message: "User registered successfully" }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error registering user" }), {
      status: 500,
    });
  }
}
