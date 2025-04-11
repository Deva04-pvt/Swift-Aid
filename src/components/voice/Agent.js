"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk"; // Ensure this SDK is implemented or imported

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

  return (
    <div>
      <h1>Voice Agent</h1>
      <button onClick={handleCall}>Start Call</button>
      <button onClick={handleDisconnect}>End Call</button>
    </div>
  );
};

export default Agent;
