"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { Mic, MicOff, Phone, PhoneOff, Bot, User } from 'lucide-react';

const Agent = ({ userName, userId, type, questions }) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState("INACTIVE");
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus("ACTIVE");
    const onCallEnd = () => setCallStatus("FINISHED");
    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
    };
  }, []);

  const handleCall = async () => {
    setCallStatus("CONNECTING");
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
      variableValues: { username: userName, userid: userId },
    });
  };

  const handleDisconnect = () => {
    setCallStatus("FINISHED");
    vapi.stop();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500";
      case "CONNECTING": return "bg-yellow-500";
      case "FINISHED": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Voice Assistant</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(callStatus)} animate-pulse`} />
              <span className="text-sm text-gray-600">{callStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCall}
            disabled={callStatus !== "INACTIVE"}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              callStatus === "INACTIVE"
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Phone className="w-5 h-5" />
            <span>Start Call</span>
          </button>
          <button
            onClick={handleDisconnect}
            disabled={callStatus !== "ACTIVE"}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              callStatus === "ACTIVE"
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[500px] flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-gray-100"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p>{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bot className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg">Start a call to begin the conversation</p>
            </div>
          )}
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 py-4 text-blue-600">
            <Mic className="w-5 h-5 animate-pulse" />
            <span>Listening...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;
