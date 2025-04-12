"use client";
import { useSession } from "next-auth/react";
import Agent from "@/components/voice/Agent";
import { AlertTriangle, Mic } from "lucide-react";

export default function VoiceAssistance() {
  const { data: session } = useSession();

  // Get user name from session or use placeholder
  const userName = session?.user?.name || "Patient";
  const userId = session?.user?.id || "guest";

  // Sample emergency questions
  const emergencyQuestions = [
    "What should I do for a severe burn?",
    "How do I control bleeding?",
    "What are the signs of a heart attack?",
    "How do I help someone who is choking?",
    "What should I do for a suspected fracture?",
    "How to recognize signs of stroke?",
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-md border border-gray-700 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2 flex items-center">
          <Mic className="h-7 w-7 mr-3 text-teal-400" />
          Voice-Based Medical Assistance
        </h1>
        <p className="text-gray-300">
          Talk to our AI assistant for emergency guidance and medical
          information
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-900/20 p-4 rounded-lg border border-red-600 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-300 mb-1">Important Notice</h3>
            <p className="text-red-200 text-sm">
              This is an AI assistant and not a substitute for professional
              medical help. In case of serious medical emergencies, please call
              your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Voice Agent Component */}
      <Agent
        userName={userName}
        userId={userId}
        type="emergency"
        questions={emergencyQuestions}
      />
    </div>
  );
}
