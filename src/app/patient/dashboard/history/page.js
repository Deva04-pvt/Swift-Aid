"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function BurnHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/burn-history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data.data);
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
    return <div>Loading history...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Burn Classification History</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <div key={item._id} className="border rounded-lg p-4 shadow-md">
            <img 
              src={item.imageUrl} 
              alt="Burn Classification" 
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <div className="mt-2">
              <p className="font-semibold">Prediction: {item.prediction}</p>
              <p>Confidence: {item.confidence}%</p>
              <p className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}