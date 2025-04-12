"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RealTimeVitals from "@/components/patient/RealTimeVitals";
import {
  Activity,
  ArrowLeft,
  Stethoscope,
  Users,
  Search,
  UserCircle,
  Heart,
  UserCheck,
  Calendar,
  Clock,
  Filter,
  X,
} from "lucide-react";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterActive, setFilterActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, critical, stable
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewing on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients");
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data = await response.json();

        // Add some mock status data for demonstration
        const enhancedData = data.patients.map((patient) => ({
          ...patient,
          status: Math.random() > 0.8 ? "critical" : "stable",
          lastCheckup: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 86400000
          ).toISOString(),
          heartRate: Math.floor(60 + Math.random() * 40),
          age: 25 + Math.floor(Math.random() * 50),
        }));

        setPatients(enhancedData);
        setFilteredPatients(enhancedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term and status filter
  useEffect(() => {
    let result = patients;

    if (searchTerm) {
      result = result.filter(
        (patient) =>
          (
            patient.firstName?.toLowerCase() +
            " " +
            patient.lastName?.toLowerCase()
          ).includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((patient) => patient.status === statusFilter);
    }

    setFilteredPatients(result);
  }, [searchTerm, statusFilter, patients]);

  // Format date to human-readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get days since last checkup
  const getDaysSince = (dateString) => {
    const checkup = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - checkup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-300">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-900/20 rounded-lg border-l-4 border-red-600">
        <p className="text-red-300 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-fadeIn">
      {!selectedPatient ? (
        <>
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-md border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-teal-400 mr-3 flex-shrink-0" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                    My Patients
                  </h1>
                  <p className="text-sm sm:text-base text-gray-300">
                    Manage and monitor your patients health information
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search input - full width on small screens */}
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full bg-gray-700/60 text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* View toggle and filter buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex rounded-lg overflow-hidden border border-gray-600">
                    <button
                      className={`px-3 py-2 flex items-center ${
                        viewMode === "grid"
                          ? "bg-teal-700 text-white"
                          : "bg-gray-700 text-gray-300"
                      } transition-colors`}
                      onClick={() => setViewMode("grid")}
                    >
                      <span className="grid grid-cols-2 gap-0.5 mr-1.5">
                        <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                        <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                        <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                        <span className="w-1.5 h-1.5 bg-current rounded-sm"></span>
                      </span>
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      className={`px-3 py-2 flex items-center ${
                        viewMode === "list"
                          ? "bg-teal-700 text-white"
                          : "bg-gray-700 text-gray-300"
                      } transition-colors`}
                      onClick={() => setViewMode("list")}
                    >
                      <span className="flex flex-col gap-0.5 mr-1.5">
                        <span className="w-4 h-0.5 bg-current rounded-sm"></span>
                        <span className="w-4 h-0.5 bg-current rounded-sm"></span>
                        <span className="w-4 h-0.5 bg-current rounded-sm"></span>
                      </span>
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      className={`px-3 py-2 rounded-lg flex items-center ${
                        filterActive
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 border border-gray-600"
                      } transition-colors`}
                      onClick={() => setFilterActive(!filterActive)}
                    >
                      <Filter className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Filter</span>
                    </button>

                    {filterActive && (
                      <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-3 z-10 w-48">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-gray-200 font-medium">
                            Filter By
                          </h4>
                          <button
                            className="text-gray-400 hover:text-gray-200"
                            onClick={() => setFilterActive(false)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <button
                            className={`w-full text-left px-3 py-2 rounded-md ${
                              statusFilter === "all"
                                ? "bg-teal-700 text-white"
                                : "hover:bg-gray-700 text-gray-300"
                            }`}
                            onClick={() => {
                              setStatusFilter("all");
                              isMobile && setFilterActive(false);
                            }}
                          >
                            All Patients
                          </button>
                          <button
                            className={`w-full text-left px-3 py-2 rounded-md ${
                              statusFilter === "critical"
                                ? "bg-red-900 text-white"
                                : "hover:bg-gray-700 text-gray-300"
                            }`}
                            onClick={() => {
                              setStatusFilter("critical");
                              isMobile && setFilterActive(false);
                            }}
                          >
                            Critical Status
                          </button>
                          <button
                            className={`w-full text-left px-3 py-2 rounded-md ${
                              statusFilter === "stable"
                                ? "bg-green-800 text-white"
                                : "hover:bg-gray-700 text-gray-300"
                            }`}
                            onClick={() => {
                              setStatusFilter("stable");
                              isMobile && setFilterActive(false);
                            }}
                          >
                            Stable Status
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Summary - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600 flex items-center">
                <div className="bg-blue-900/30 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Total Patients
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-200">
                    {patients.length}
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600 flex items-center">
                <div className="bg-red-900/30 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Critical Status
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-200">
                    {patients.filter((p) => p.status === "critical").length}
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600 flex items-center sm:col-span-2 md:col-span-1">
                <div className="bg-green-900/30 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Checkups Today
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-200">
                    {Math.floor(patients.length * 0.3)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center p-6 sm:p-12 bg-gray-800 rounded-xl border border-gray-700">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 font-medium text-lg">
                No patients found
              </p>
              <p className="text-gray-400 mt-1 max-w-md mx-auto">
                {searchTerm
                  ? `No results match "${searchTerm}"`
                  : "Your patient list is empty. Patients will appear here once they register."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 bg-gray-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            // Grid View - Responsive grid with fewer columns on small screens
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] hover:border-gray-600"
                >
                  <div
                    className={`h-2 w-full ${
                      patient.status === "critical"
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  ></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-gray-700 rounded-full p-2">
                          <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-200 text-sm sm:text-base">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          {/* <p className="text-xs sm:text-sm text-gray-400">
                            Age {patient.age}
                          </p> */}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.status === "critical"
                            ? "bg-red-900/20 text-red-400 border border-red-800/50"
                            : "bg-green-900/20 text-green-400 border border-green-800/50"
                        }`}
                      >
                        {patient.status === "critical" ? "Critical" : "Stable"}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                      <div className="flex items-center text-xs sm:text-sm">
                        <Heart className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-gray-300">
                          HR: {patient.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm">
                        <Clock className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-gray-300">
                          Last checkup: {formatDate(patient.lastCheckup)}
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm">
                        <Calendar className="h-4 w-4 text-teal-400 mr-2" />
                        <span
                          className={`${
                            getDaysSince(patient.lastCheckup) > 20
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          {getDaysSince(patient.lastCheckup)} days since last
                          visit
                        </span>
                      </div>
                    </div>

                    <button
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm"
                      onClick={() => setSelectedPatient(patient._id)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Monitor Vitals
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View - Responsive table with horizontal scroll on small screens
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                        Last Checkup
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                        Heart Rate
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient._id}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-700 rounded-full p-1 mr-2 sm:mr-3 hidden sm:block">
                              <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-200 text-sm sm:text-base">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                                {patient.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              patient.status === "critical"
                                ? "bg-red-900/20 text-red-400 border border-red-800/50"
                                : "bg-green-900/20 text-green-400 border border-green-800/50"
                            }`}
                          >
                            {patient.status === "critical"
                              ? "Critical"
                              : "Stable"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                          {formatDate(patient.lastCheckup)}
                          <div
                            className={`text-xs ${
                              getDaysSince(patient.lastCheckup) > 20
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                          >
                            {getDaysSince(patient.lastCheckup)} days ago
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center">
                            <Heart
                              className={`h-4 w-4 mr-2 ${
                                patient.heartRate > 90
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            />
                            <span className="text-gray-300">
                              {patient.heartRate} bpm
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                          <button
                            className="text-teal-400 hover:text-teal-300 bg-teal-900/30 hover:bg-teal-900/50 py-1 sm:py-1.5 px-3 sm:px-4 rounded-lg transition-colors"
                            onClick={() => setSelectedPatient(patient._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-md border border-gray-700 mb-6">
            <div className="flex items-center">
              <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-teal-400 mr-3 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1">
                  Real-Time Monitoring
                </h1>
                <p className="text-sm sm:text-base text-gray-300">
                  Track vital signs and health metrics of your patient in real
                  time
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-700">
            <button
              className="mb-6 inline-flex items-center bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              onClick={() => setSelectedPatient(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient List
            </button>

            <RealTimeVitals userId={selectedPatient} />
          </div>
        </div>
      )}
    </div>
  );
}
