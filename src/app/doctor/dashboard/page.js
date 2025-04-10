"use client";
import { useSession } from "next-auth/react";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome Dr. {session?.user.name}</h1>
    </div>
  );
}
