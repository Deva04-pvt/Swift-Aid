"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ variant = "default" }) {
  const getButtonStyles = () => {
    switch (variant) {
      case "compact":
        return "bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm";
      case "text":
        return "text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center gap-1 text-sm";
      case "outline":
        return "border border-gray-700 hover:border-red-600 text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 bg-transparent hover:bg-gray-800";
      default:
        return "bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2";
    }
  };

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={getButtonStyles()}
      aria-label="Logout"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
}
