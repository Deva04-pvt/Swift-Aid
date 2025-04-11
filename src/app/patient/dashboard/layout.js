"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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
    ],
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Dashboard</h2>
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
                        pathname === link.path &&
                          "bg-blue-500 text-white font-medium"
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
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
