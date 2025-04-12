"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// const navItems = [
//   {
//     section: "Emergency Response",
//     links: [
//       {
//         name: "Wound Classification",
//         path: "/patient/dashboard/emergency/wound",
//       },
//       {
//         name: "Burn Classification",
//         path: "/patient/dashboard/emergency/burn",
//       },
//       { name: "Voice Assistance", path: "/patient/dashboard/emergency/voice" },
//     ],
//   },
//   {
//     section: "Remote Monitoring",
//     links: [
//       { name: "Vitals Dashboard", path: "/patient/dashboard/monitoring" },
//     ],
//   },
// ];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar
      <aside className="w-64 bg-gray-800 shadow-lg p-6 border-r border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-teal-300">
          Patient Dashboard
        </h2>
        <nav className="space-y-4">
          {navItems.map((group) => (
            <div key={group.section}>
              <h3 className="text-sm text-gray-400 mb-1">{group.section}</h3>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={clsx(
                        "block px-3 py-2 rounded-md hover:bg-gray-700 text-gray-300",
                        pathname === link.path &&
                          "bg-teal-900/60 text-teal-300 font-medium"
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
      </aside> */}

      {/* Page Content */}
      <main className="flex-1 p-6 bg-gray-900 text-gray-200">{children}</main>
    </div>
  );
}
