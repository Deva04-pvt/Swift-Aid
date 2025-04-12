"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RealTimeVitals from "@/components/patient/RealTimeVitals";
import { Activity } from "lucide-react";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null); // State to track the selected patient

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients");
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data = await response.json();
        setPatients(data.patients);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

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
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      {!selectedPatient ? (
        <>
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Patient List</h1>
            <p className="text-gray-300">
              View all registered patients and their details.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 transition-all duration-300 hover:shadow-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-gray-300">
                  <th className="p-3 text-left">First Name</th>
                  <th className="p-3 text-left">Last Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Medical Condition</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="p-3 border-t border-gray-700 text-gray-300">
                      {patient.firstName}
                    </td>
                    <td className="p-3 border-t border-gray-700 text-gray-300">
                      {patient.lastName}
                    </td>
                    <td className="p-3 border-t border-gray-700 text-gray-300">
                      {patient.email}
                    </td>
                    <td className="p-3 border-t border-gray-700 text-gray-300">
                      <button
                        className="bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setSelectedPatient(patient._id)}
                      >
                        Monitor Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center">
              <Activity className="h-7 w-7 mr-3 text-teal-400" />
              Real-Time Monitoring
            </h1>
            <p className="text-gray-300">
              Track the vital signs and health metrics of the selected patient in real time.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
            <button
              className="mb-4 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              onClick={() => setSelectedPatient(null)}
            >
              Back to Patient List
            </button>
            <RealTimeVitals userId={selectedPatient} />
          </div>
        </div>
      )}
    </div>
  );
}
