"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { History, Flame, Bandage, AlertCircle, Loader2 } from "lucide-react";

export default function MedicalHistory() {
  const { data: session } = useSession();
  const [burnHistory, setBurnHistory] = useState([]);
  const [woundHistory, setWoundHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("burn"); // 'burn' or 'wound'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);

        // Fetch burn history
        const burnResponse = await fetch("/api/burn-history");
        if (!burnResponse.ok) {
          throw new Error("Failed to fetch burn history");
        }
        const burnData = await burnResponse.json();
        setBurnHistory(burnData.data);

        // Fetch wound history
        const woundResponse = await fetch("/api/wound-history");
        if (!woundResponse.ok) {
          throw new Error("Failed to fetch wound history");
        }
        const woundData = await woundResponse.json();
        setWoundHistory(woundData.data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchHistory();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-teal-400 mb-4" />
          <p className="text-gray-300">Loading your medical history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-5 rounded-xl shadow-md border-l-4 border-red-600 max-w-3xl mx-auto my-8">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-300 mb-1">
              Error Loading History
            </h3>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2 flex items-center">
          <History className="h-7 w-7 mr-3 text-teal-400" />
          Medical Analysis History
        </h1>
        <p className="text-gray-300">
          View your past burn and wound classification analyses
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("burn")}
          className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${
            activeTab === "burn"
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          <Flame
            className={`h-5 w-5 mr-2 ${
              activeTab === "burn" ? "text-white" : "text-red-400"
            }`}
          />
          Burn History
        </button>
        <button
          onClick={() => setActiveTab("wound")}
          className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${
            activeTab === "wound"
              ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          <Bandage
            className={`h-5 w-5 mr-2 ${
              activeTab === "wound" ? "text-white" : "text-teal-400"
            }`}
          />
          Wound History
        </button>
      </div>

      {/* Content */}
      <div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(activeTab === "burn" ? burnHistory : woundHistory).map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-700"
            >
              <div className="h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={`${
                    activeTab === "burn" ? "Burn" : "Wound"
                  } Classification`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-semibold text-lg text-gray-100">
                    {item.prediction}
                  </p>
                  <div
                    className={`text-sm py-1 px-2 rounded-full ${
                      item.confidence > 90
                        ? "bg-green-900/30 text-green-400 border border-green-700"
                        : item.confidence > 70
                        ? "bg-teal-900/30 text-teal-400 border border-teal-700"
                        : "bg-yellow-900/30 text-yellow-400 border border-yellow-700"
                    }`}
                  >
                    {item.confidence}% confidence
                  </div>
                </div>

                <div className="mt-2 text-sm space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400">Size:</div>
                    <div className="text-gray-300">
                      {item.width}x{item.height}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400">Format:</div>
                    <div className="text-gray-300">{item.format}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400">Date:</div>
                    <div className="text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === "burn" && burnHistory.length === 0) ||
          (activeTab === "wound" && woundHistory.length === 0)) && (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 shadow-md my-6">
            <div className="w-20 h-20 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              {activeTab === "burn" ? (
                <Flame className="h-10 w-10 text-gray-500" />
              ) : (
                <Bandage className="h-10 w-10 text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No history found
            </h3>
            <p className="text-gray-400">
              You haven't analyzed any{" "}
              {activeTab === "burn" ? "burns" : "wounds"} yet.
            </p>
            <button
              onClick={() =>
                (window.location.href = `/patient/dashboard/emergency/${activeTab}`)
              }
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-md"
            >
              Analyze a {activeTab === "burn" ? "burn" : "wound"} now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
