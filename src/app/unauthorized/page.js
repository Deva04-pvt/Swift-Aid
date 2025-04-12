"use client";
import Link from "next/link";
import { Shield, ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-900/30 text-red-400">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold text-red-400 mb-3">
          403 - Unauthorized
        </h1>

        <p className="text-gray-300 mb-6">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftCircle className="w-5 h-5" />
            Go Back
          </button>

          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white rounded-lg transition-colors duration-200 shadow-md"
          >
            Return to Homepage
          </Link>
        </div>
      </div>

      <div className="mt-6 text-gray-400 text-sm max-w-md text-center">
        If you need assistance, please contact our{" "}
        <span className="text-teal-400">support team</span> for help resolving
        this issue.
      </div>
    </div>
  );
}
