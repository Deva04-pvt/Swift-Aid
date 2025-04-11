"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton"; // Adjust path if needed

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleRedirect = () => {
    if (!session) return router.push("/signin");
    if (session.user.role === "Doctor") router.push("/doctor/dashboard");
    else if (session.user.role === "Patient") router.push("/patient/dashboard");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Swift-Aid</h1>
      <p className="text-lg text-gray-700 mb-8">
        A role-based health portal for doctors and patients.
      </p>

      <button
        onClick={handleRedirect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg transition"
      >
        {session ? "Go to Dashboard" : "Get Started"}
      </button>

      {session && <LogoutButton />}
    </main>
  );
}
