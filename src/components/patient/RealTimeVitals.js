"use client";
import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

// Component for individual vital tile with circular gauge effect
const VitalTile = ({
  icon,
  title,
  value,
  unit,
  min,
  max,
  color = "#3b82f6",
}) => {
  // Ensure value is a number with a fallback to min
  const numValue = isNaN(parseFloat(value)) ? min : parseFloat(value);

  // Calculate the percentage for the gauge (clamped between min and max)
  const percentage = Math.min(
    Math.max(((numValue - min) / (max - min)) * 100, 0),
    100
  );

  // Calculate the stroke dasharray and dashoffset for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Ensure we're not getting NaN by providing a fallback
  const strokeDashoffset = isNaN(percentage)
    ? circumference
    : circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xl mr-2">{icon}</span>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background circle */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="5"
          />
          {/* Progress circle with transition */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
          />
        </svg>

        {/* Value display in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold">
            {value}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </div>
        </div>
      </div>

      {/* Min and max labels */}
      <div className="w-full flex justify-between mt-2">
        <span className="text-xs text-gray-500">{min}</span>
        <span className="text-xs text-gray-500">{max}</span>
      </div>
    </div>
  );
};

export default function RealTimeVitals({ userId }) {
  const [vitals, setVitals] = useState(null);
  const [connected, setConnected] = useState(false);
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
    const topic = `patient/health/${userId}`;

    client.on("connect", () => {
      setConnected(true);
      client.subscribe(topic, (err) => {
        if (err) console.error("Subscription error:", err);
      });
    });

    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        setVitals(data);
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    });

    client.on("error", (err) => {
      console.error("MQTT Error:", err.message);
    });

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.unsubscribe(topic, () => {
          clientRef.current.end(true);
        });
      }
    };
  }, [userId]);

  if (!connected) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2">Connecting to live vitals...</p>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2">Waiting for data...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Vitals</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <VitalTile
          icon="❤️"
          title="Heart Rate"
          value={vitals.heartRate}
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
          color="#3b82f6" // Blue
        />
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-xl mr-2">⏰</span>
            <h3 className="text-sm font-medium text-gray-600">Last Updated</h3>
          </div>
          <div className="text-center text-sm mt-2">{vitals.timestamp}</div>
        </div>
      </div>
    </div>
  );
}
