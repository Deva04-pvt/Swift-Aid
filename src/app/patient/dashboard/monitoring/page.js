"use client";
import { useSession } from "next-auth/react";

export default function VitalsDashboard() {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Real-Time Vitals Dashboard Hello {session?.user.name}
      </h1>
      <p>This page will display health vitals tracked in real-time.</p>
    </div>
  );
}
