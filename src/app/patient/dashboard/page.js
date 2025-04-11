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
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {userName.split(" ")[0]}
        </h1>
        <p className="text-gray-600">
          Monitor your health and access medical services from your personal
          dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Hospital Search */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
              <Map className="mr-2 h-5 w-5" />
              Find Nearby Hospitals
            </h2>
            <HospitalSearch />
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  href={action.path}
                  key={index}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className={`p-3 rounded-full mb-2 ${action.bgColor}`}>
                    {action.icon}
                  </div>
                  <span className="text-sm text-center text-gray-700">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Health Tips */}
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Health Tips
            </h2>
            <div className="space-y-3">
              {healthTips.map((tip, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          {/* Emergency SOS */}
          <div className="bg-red-50 p-6 rounded-xl shadow-sm mb-6 border-l-4 border-red-500 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Emergency SOS
            </h2>
            {userId && <SOSSection userId={userId} />}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Appointments
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3 mb-2">
                <Clock className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">No appointments</p>
                  <p className="text-sm text-gray-600">
                    Your schedule is clear
                  </p>
                </div>
              </div>
              <Link href="/patient/dashboard/appointments">
                <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Schedule Appointment
                </button>
              </Link>
            </div>
          </div>

          {/* Health Stats Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Health Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Heart Rate</span>
                <span className="font-medium text-gray-800">72 bpm</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blood Pressure</span>
                <span className="font-medium text-gray-800">120/80</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>

              <Link href="/patient/dashboard/monitoring">
                <button className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
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
    icon: <Activity className="h-5 w-5 text-blue-500" />,
    path: "/patient/dashboard/monitoring",
    bgColor: "bg-blue-100",
  },
  {
    name: "Emergency Help",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    path: "/patient/dashboard/emergency/wound",
    bgColor: "bg-red-100",
  },
  {
    name: "Appointments",
    icon: <Calendar className="h-5 w-5 text-purple-500" />,
    path: "/patient/dashboard/appointments",
    bgColor: "bg-purple-100",
  },
  {
    name: "Medical Records",
    icon: <FileText className="h-5 w-5 text-green-500" />,
    path: "/patient/dashboard/records",
    bgColor: "bg-green-100",
  },
  {
    name: "Chat Doctor",
    icon: <MessageSquare className="h-5 w-5 text-yellow-500" />,
    path: "/patient/dashboard/chat",
    bgColor: "bg-yellow-100",
  },
  {
    name: "Health Timeline",
    icon: <Clock className="h-5 w-5 text-indigo-500" />,
    path: "/patient/dashboard/history",
    bgColor: "bg-indigo-100",
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
