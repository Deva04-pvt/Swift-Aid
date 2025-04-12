"use client";
import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import { Activity, AlertCircle } from "lucide-react";

// Component for individual vital tile with enhanced circular gauge effect
const VitalTile = ({
  icon,
  title,
  value,
  unit,
  min,
  max,
  color = "#14b8a6", // Default to teal-500
}) => {
  const numValue = isNaN(parseFloat(value)) ? min : parseFloat(value);
  const percentage = Math.min(
    Math.max(((numValue - min) / (max - min)) * 100, 0),
    100
  );

  const radius = 38; // Slightly smaller radius to accommodate thicker stroke
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(percentage)
    ? circumference
    : circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center border border-gray-700">
      <div className="flex items-center justify-center mb-3">
        <div className="text-2xl mr-2">{icon}</div>
        <h3 className="text-sm font-medium text-gray-200">{title}</h3>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gray-700 rounded-full opacity-30"></div>

        {/* SVG Gauge */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Trail background */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#374151" // gray-700
            strokeWidth="8" // Thicker stroke
            strokeLinecap="round"
          />

          {/* Progress with gradient */}
          <defs>
            <linearGradient
              id={`gradient-${title.replace(/\s+/g, "")}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={`url(#gradient-${title.replace(/\s+/g, "")})`}
            strokeWidth="8" // Thicker stroke
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
          />
        </svg>

        {/* Value display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold text-gray-100">
            {value}
            <span className="text-sm font-normal ml-1 text-gray-400">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Min and max labels */}
      <div className="w-full flex justify-between mt-3 px-2">
        <span className="text-xs font-medium text-gray-400">{min}</span>
        <span className="text-xs font-medium text-gray-400">{max}</span>
      </div>
    </div>
  );
};

export default function RealTimeVitals({ userId }) {
  const [vitals, setVitals] = useState(null);
  const [heartRate, setHeartRate] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const client = mqtt.connect(
      "wss://f8100f3ba7cf45558c79b58a122928fb.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "swiftadmin",
        password: "Hello@2004",
        reconnectPeriod: 1000,
      }
    );

    clientRef.current = client;

    const healthTopic = `patient/health/${userId}`;
    const watchTopic = `watch/heart/${userId}`;

    client.on("connect", () => {
      setConnected(true);

      // Subscribe to both health and watch data
      client.subscribe([healthTopic, watchTopic], (err) => {
        if (err) {
          console.error("Subscription error:", err);
          setError("Failed to subscribe to vital topics");
        }
      });

      // Publish retained userId
      client.publish(
        "current/user",
        userId,
        { retain: true, qos: 1 },
        (err) => {
          if (err) console.error("Publish error:", err);
        }
      );
    });

    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (topic === healthTopic) {
          setVitals(data);
        } else if (topic === watchTopic && data.heartRate) {
          setHeartRate(data.heartRate);
        }
      } catch (err) {
        console.error("Invalid JSON from topic", topic, err);
      }
    });

    client.on("error", (err) => {
      console.error("MQTT Error:", err.message);
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.unsubscribe([healthTopic, watchTopic], () => {
          clientRef.current.end(true);
        });
      }
    };
  }, [userId]);

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="flex items-center text-red-400 mb-4">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold">Connection Error</h2>
        </div>
        <p className="text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-300">
          Connecting to vital monitoring system...
        </p>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-300">
          Retrieving your vital signs data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-teal-400 mb-6 flex items-center">
        <Activity className="h-6 w-6 mr-2" />
        Live Vitals Monitoring
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <VitalTile
          icon="❤️"
          title="Heart Rate"
          value={heartRate ?? "-"}
          unit="bpm"
          min={40}
          max={180}
          color="#ef4444" // Red
        />
        <VitalTile
          icon="🫁"
          title="Respiratory Rate"
          value={vitals.respiratoryRate}
          unit="br/min"
          min={8}
          max={30}
          color="#8b5cf6" // Purple
        />
        <VitalTile
          icon="🌡"
          title="Temperature"
          value={vitals.temperature}
          unit="°C"
          min={35}
          max={40}
          color="#f97316" // Orange
        />
        <VitalTile
          icon="💨"
          title="SpO2"
          value={vitals.oxygenSaturation}
          unit="%"
          min={80}
          max={100}
          color="#10b981" // Green
        />
        <VitalTile
          icon="🩸"
          title="Blood Pressure"
          value={vitals.bloodPressure}
          unit=""
          min={90}
          max={180}
          color="#0ea5e9" // Sky blue
        />

        {/* Last Updated Tile */}
        <div className="bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center border border-gray-700">
          <div className="flex items-center justify-center mb-3">
            <div className="text-2xl mr-2">⏰</div>
            <h3 className="text-sm font-medium text-gray-200">Last Updated</h3>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-xl font-medium text-gray-200">
              {new Date(vitals.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {new Date(vitals.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
