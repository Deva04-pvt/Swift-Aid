"use client";
import { useSession } from "next-auth/react";

export default function PatientDashboard() {
  const { data: session } = useSession();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Hello {session?.user.name}</h1>
    </div>
  );
}
