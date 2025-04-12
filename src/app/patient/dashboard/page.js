import HospitalSearch from "@/components/patient/HospitalSearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SOSSection from "@/components/patient/SOSSection";
import Link from "next/link";
import {
  Activity,
  Calendar,
  Clock,
  Map,
  MessageSquare,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default async function PatientDashboardHome() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Patient";

  return (
    <div className="animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Welcome, {userName.split(" ")[0]}
        </h1>
        <p className="text-gray-300">
          Monitor your health and access medical services from your personal
          dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Hospital Search */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 mb-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Find Nearby Hospitals
            </h2>
            <HospitalSearch />
          </div>

          {/* Health Tips */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Health Tips
            </h2>
            <div className="space-y-3">
              {healthTips.map((tip, index) => (
                <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-medium text-gray-200 mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-300">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          {/* Emergency SOS */}
          <div className="bg-red-900/20 p-6 rounded-xl shadow-md border-l-4 border-red-600 mb-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Emergency SOS
            </h2>
            {userId && <SOSSection userId={userId} />}
          </div>

          {/* Health Stats Summary */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Health Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Heart Rate</span>
                <span className="font-medium text-gray-200">72 bpm</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-teal-500 h-2.5 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Blood Pressure</span>
                <span className="font-medium text-gray-200">120/80</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-cyan-500 h-2.5 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>

              <Link href="/patient/dashboard/monitoring">
                <button className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  View All Vitals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick actions data
const quickActions = [
  {
    name: "Check Vitals",
    icon: <Activity className="h-5 w-5 text-teal-500" />,
    path: "/patient/dashboard/monitoring",
    bgColor: "bg-gray-700",
  },
  {
    name: "Emergency Help",
    icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    path: "/patient/dashboard/emergency/wound",
    bgColor: "bg-gray-700",
  },
  {
    name: "Appointments",
    icon: <Calendar className="h-5 w-5 text-cyan-500" />,
    path: "/patient/dashboard/appointments",
    bgColor: "bg-gray-700",
  },
  {
    name: "Medical Records",
    icon: <FileText className="h-5 w-5 text-emerald-500" />,
    path: "/patient/dashboard/records",
    bgColor: "bg-gray-700",
  },
  {
    name: "Chat Doctor",
    icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
    path: "/patient/dashboard/chat",
    bgColor: "bg-gray-700",
  },
  {
    name: "Health Timeline",
    icon: <Clock className="h-5 w-5 text-teal-400" />,
    path: "/patient/dashboard/history",
    bgColor: "bg-gray-700",
  },
];

// Health tips data
const healthTips = [
  {
    title: "Stay Hydrated",
    content:
      "Drink at least 8 glasses of water daily to maintain proper body function and prevent dehydration.",
  },
  {
    title: "Regular Exercise",
    content:
      "Aim for at least 30 minutes of moderate exercise most days of the week to improve heart health.",
  },
  {
    title: "Sleep Well",
    content:
      "Adults should get 7-9 hours of quality sleep each night for optimal mental and physical health.",
  },
];
