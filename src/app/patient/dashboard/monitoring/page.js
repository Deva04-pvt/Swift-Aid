"use client";
import { useSession } from "next-auth/react";
import RealTimeVitals from "@/components/patient/RealTimeVitals";

export default function MonitoringPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">📊 Real-Time Monitoring</h1>
      {userId ? (
        <RealTimeVitals userId={userId} />
      ) : (
        <p>Loading user session...</p>
      )}
    </div>
  );
}
