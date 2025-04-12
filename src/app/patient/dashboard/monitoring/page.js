"use client";
import { useSession } from "next-auth/react";
import RealTimeVitals from "@/components/patient/RealTimeVitals";
import { Activity } from "lucide-react";

export default function MonitoringPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <div className="animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center">
          <Activity className="h-7 w-7 mr-3 text-teal-400" />
          Real-Time Monitoring
        </h1>
        <p className="text-gray-300">
          Track your vital signs and health metrics in real time
        </p>
      </div>

      {userId ? (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
          <RealTimeVitals userId={userId} />
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-700 h-12 w-12 mb-4 flex items-center justify-center">
              <Activity className="h-6 w-6 text-teal-500/50" />
            </div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading user session...</p>
        </div>
      )}
    </div>
  );
}
