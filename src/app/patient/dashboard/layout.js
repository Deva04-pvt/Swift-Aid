"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import {
  UserCircle,
  Home,
  AlertTriangle,
  Activity,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Heart,
  Bell,
} from "lucide-react";

const navItems = [
  {
    section: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    links: [{ name: "Overview", path: "/patient/dashboard" }],
  },
  {
    section: "Emergency Response",
    icon: <AlertTriangle className="w-5 h-5" />,
    links: [
      {
        name: "Wound Classification",
        path: "/patient/dashboard/emergency/wound",
      },
      {
        name: "Burn Classification",
        path: "/patient/dashboard/emergency/burn",
      },
      { name: "Voice Assistance", path: "/patient/dashboard/emergency/voice" },
    ],
  },
  {
    section: "Remote Monitoring",
    icon: <Activity className="w-5 h-5" />,
    links: [
      { name: "Vitals Dashboard", path: "/patient/dashboard/monitoring" },
      { name: "Response History", path: "/patient/dashboard/history" },
    ],
  },
];

export default function PatientDashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const firstName = session?.user?.name?.split(" ")[0] || "Patient";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-30 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo and Close button for mobile */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-blue-800">
                SwiftAid
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 md:hidden"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-5 border-b">
            <Link
              href="/patient/profile"
              className="flex items-center space-x-3 hover:bg-blue-50 p-3 rounded-xl transition-colors duration-200"
            >
              <div className="bg-blue-100 rounded-full p-2">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{firstName}</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((group) => (
              <div key={group.section} className="px-4 mb-4">
                <button
                  onClick={() => toggleSection(group.section)}
                  className="w-full flex items-center justify-between p-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">{group.icon}</div>
                    <span className="font-medium">{group.section}</span>
                  </div>
                  <ChevronRight
                    className={clsx(
                      "h-4 w-4 text-gray-500 transition-transform duration-200",
                      expandedSection === group.section && "transform rotate-90"
                    )}
                  />
                </button>

                {(expandedSection === group.section ||
                  group.section === "Dashboard") && (
                  <ul className="mt-1 ml-10 space-y-1">
                    {group.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          href={link.path}
                          className={clsx(
                            "block px-3 py-2 rounded-lg text-sm transition-colors duration-200",
                            pathname === link.path
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-5 md:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="md:hidden flex items-center">
              <Heart className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">SwiftAid</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {/* Content container with max width */}
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-xs text-gray-500">
          <p>© 2025 SwiftAid. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
