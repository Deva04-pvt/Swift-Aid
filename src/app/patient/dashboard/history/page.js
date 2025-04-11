"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function MedicalHistory() {
  const { data: session } = useSession();
  const [burnHistory, setBurnHistory] = useState([]);
  const [woundHistory, setWoundHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('burn'); // 'burn' or 'wound'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        // Fetch burn history
        const burnResponse = await fetch('/api/burn-history');
        if (!burnResponse.ok) {
          throw new Error('Failed to fetch burn history');
        }
        const burnData = await burnResponse.json();
        setBurnHistory(burnData.data);

        // Fetch wound history
        const woundResponse = await fetch('/api/wound-history');
        if (!woundResponse.ok) {
          throw new Error('Failed to fetch wound history');
        }
        const woundData = await woundResponse.json();
        setWoundHistory(woundData.data);

      } catch (error) {
        console.error('Error fetching history:', error);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('burn')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'burn'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Burn History
        </button>
        <button
          onClick={() => setActiveTab('wound')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'wound'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Wound History
        </button>
      </div>

      {/* Content */}
      <div>
        <h1 className="text-2xl font-bold mb-4">
          {activeTab === 'burn' ? 'Burn' : 'Wound'} Classification History
        </h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(activeTab === 'burn' ? burnHistory : woundHistory).map((item) => (
            <div key={item._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src={item.imageUrl} 
                alt={`${activeTab === 'burn' ? 'Burn' : 'Wound'} Classification`} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-lg">
                  Prediction: {item.prediction}
                </p>
                <p className="text-blue-600">
                  Confidence: {item.confidence}%
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Size: {item.width}x{item.height}</p>
                  <p>Format: {item.format}</p>
                  <p>Date: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === 'burn' && burnHistory.length === 0) || 
          (activeTab === 'wound' && woundHistory.length === 0)) && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No {activeTab === 'burn' ? 'burn' : 'wound'} classification history found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}