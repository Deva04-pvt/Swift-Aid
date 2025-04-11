"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { UserCircle } from "lucide-react"; // Optional: user icon

const navItems = [
  {
    section: "Emergency Response",
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

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-5 flex flex-col justify-between">
        {/* Top - Profile */}
        <div>
          <h2 className="text-xl font-bold mb-4">Patient Panel</h2>

          <div className="mb-6">
            <Link
              href="/patient/profile"
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded"
            >
              <UserCircle className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-800">
                Welcome, {firstName}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-4">
            {navItems.map((group) => (
              <div key={group.section}>
                <h3 className="text-sm text-gray-500 mb-1">{group.section}</h3>
                <ul className="space-y-1">
                  {group.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        className={clsx(
                          "block px-3 py-2 rounded-md hover:bg-blue-100",
                          pathname === link.path && "bg-blue-500 text-white"
                        )}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom - Sign Out */}
        <div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
