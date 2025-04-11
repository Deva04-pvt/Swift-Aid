"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { Mic, MicOff, Phone, PhoneOff, Bot, User, Waveform, Activity } from 'lucide-react';

const Agent = ({ userName, userId, type, questions }) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState("INACTIVE");
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatar, setAvatar] = useState("calm"); // calm, speaking, listening
  const messagesEndRef = useRef(null);
  
  // Audio visualization settings
  const [audioVisualization, setAudioVisualization] = useState(Array(20).fill(5));

  useEffect(() => {
    // Auto-scroll to the bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const onCallStart = () => setCallStatus("ACTIVE");
    const onCallEnd = () => setCallStatus("FINISHED");
    
    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        // Add message to chat history
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
        
        // Update avatar state based on who is speaking
        if (message.role === "assistant") {
          setAvatar("speaking");
          setTimeout(() => setAvatar("calm"), 1000);
        } else {
          setAvatar("listening");
          setTimeout(() => setAvatar("calm"), 1000);
        }
      }
      
      // Set speaking status for visual feedback
      if (message.type === "transcript" && message.transcriptType === "partial" && message.role === "user") {
        setIsSpeaking(true);
        // Create a random audio visualization pattern
        setAudioVisualization(Array(20).fill(0).map(() => Math.floor(Math.random() * 20) + 2));
      } else {
        setIsSpeaking(false);
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
    setMessages([]);
    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
        variableValues: { username: userName, userid: userId },
      });
      setAvatar("speaking");
      setTimeout(() => setAvatar("calm"), 2000);
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus("INACTIVE");
    }
  };

  const handleDisconnect = () => {
    setCallStatus("FINISHED");
    vapi.stop();
    setAvatar("calm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500";
      case "CONNECTING": return "bg-yellow-500";
      case "FINISHED": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Render a beautiful animated avatar using CSS instead of images
  const renderAvatar = () => {
    // Colors based on avatar type
    const colors = type === "emergency" 
      ? { primary: "#ef4444", secondary: "#fee2e2", border: "#fecaca" }  // Red theme
      : { primary: "#3b82f6", secondary: "#dbeafe", border: "#bfdbfe" }; // Blue theme
    
    // Animation based on avatar state
    const animation = avatar === "speaking" ? "pulse" : avatar === "listening" ? "bounce" : "";
    
    return (
      <div className="relative">
        <div className={`h-48 w-48 flex items-center justify-center rounded-full overflow-hidden 
                       bg-gradient-to-br from-${colors.secondary} to-white border-4 border-${colors.border}
                       shadow-xl transform transition-all duration-300 ${avatar !== "calm" ? "scale-105" : ""}`}>
          
          {/* Dynamic avatar face that changes with state */}
          <div className={`animate-${animation} transition-all duration-300`}>
            {/* Main avatar circle */}
            <div className={`h-32 w-32 rounded-full bg-gradient-to-br from-${colors.primary} to-blue-700 
                           flex items-center justify-center text-white shadow-inner`}>
              
              {avatar === "speaking" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Waveform/speaking animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white opacity-20 animate-ping"></div>
                  </div>
                  <svg viewBox="0 0 24 24" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none" 
                       className="animate-pulse">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
              ) : avatar === "listening" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Ear/listening animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-white opacity-20 rounded-full animate-pulse"></div>
                  </div>
                  <svg viewBox="0 0 24 24" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {/* Default state */}
                  {type === "emergency" ? (
                    <svg viewBox="0 0 24 24" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Active call indicator */}
        {callStatus === "ACTIVE" && (
          <div className="absolute -bottom-1 right-4 bg-white rounded-full p-2 shadow-lg">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(callStatus)} animate-pulse`} />
          </div>
        )}
      </div>
    );
  };

  // Custom audio visualization wave
  const AudioWave = () => {
    return (
      <div className="flex items-center gap-[2px] h-6">
        {audioVisualization.map((height, index) => (
          <div 
            key={index}
            className="w-1 bg-blue-500 rounded-full transition-all duration-100"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fadeIn">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <span className="text-blue-500 mr-2">🎙️</span> AI Voice Assistant
        </h1>
        <p className="text-gray-600">
          Speak naturally with our medical AI to get emergency guidance and health information
        </p>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar and call controls */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            {/* Avatar */}
            <div className="mb-6 flex justify-center">
              {renderAvatar()}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(callStatus)} animate-pulse`} />
              <span className="font-medium text-gray-700">
                {callStatus === "ACTIVE" ? "In Call" : 
                 callStatus === "CONNECTING" ? "Connecting..." :
                 callStatus === "FINISHED" ? "Call Ended" : "Ready"}
              </span>
            </div>
            
            {/* Call controls */}
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleCall}
                disabled={callStatus !== "INACTIVE" && callStatus !== "FINISHED"}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
                  callStatus === "INACTIVE" || callStatus === "FINISHED"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Start Conversation</span>
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={callStatus !== "ACTIVE"}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
                  callStatus === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <PhoneOff className="w-5 h-5" />
                <span className="font-medium">End Call</span>
              </button>
            </div>
            
            {/* Quick tips */}
            {callStatus === "ACTIVE" && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg w-full">
                <h3 className="font-medium text-blue-800 mb-2">Quick Tips:</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                  <li>Speak clearly and naturally</li>
                  <li>Ask about first aid procedures</li>
                  <li>Describe symptoms for guidance</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat interface */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
            {/* Chat header */}
            <div className="border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {type === "emergency" ? "Emergency Voice Guide" : "Medical Assistant"}
              </h2>
              <p className="text-sm text-gray-500">
                {callStatus === "ACTIVE" 
                  ? "Call in progress - speak after the prompt" 
                  : "Start a call to begin your conversation"}
              </p>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-2 mb-4">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        message.role === "assistant"
                          ? "bg-blue-50 text-gray-800"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-10">
                  {callStatus === "ACTIVE" ? (
                    <>
                      <Mic className="w-16 h-16 mb-4 text-blue-400" />
                      <p className="text-lg text-center">I'm listening! Please speak now...</p>
                    </>
                  ) : (
                    <>
                      <Bot className="w-16 h-16 mb-4 text-gray-400" />
                      <p className="text-lg text-center">Press "Start Conversation" to begin</p>
                      {type === "emergency" && (
                        <p className="text-sm text-center mt-2 text-red-500">
                          For medical emergencies, please also call your local emergency number
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Voice activity indicator with enhanced visualization */}
            {callStatus === "ACTIVE" && (
              <div className={`rounded-xl p-4 ${isSpeaking ? "bg-blue-50" : "bg-gray-50"} flex items-center justify-center`}>
                {isSpeaking ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-1">
                      {Array(7).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-8 bg-blue-500 rounded-full"
                          style={{
                            animation: `bounce 0.${i+2}s ease-in-out infinite alternate`,
                            transformOrigin: 'bottom'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-blue-600 text-sm mt-2">Listening to you...</p>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>Start speaking when ready</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Suggested questions */}
      {questions && questions.length > 0 && callStatus === "ACTIVE" && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-medium text-gray-800 mb-3">Suggested Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => (
              <button
                key={index}
                className="bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={() => {
                  // Add this question to the messages as if user asked it
                  setMessages((prev) => [
                    ...prev,
                    { role: "user", content: question },
                  ]);
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add keyframe animations */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1.0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Agent;
