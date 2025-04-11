import Agent from "@/components/voice/Agent";

export default function VoiceAssistance() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Voice-Based Medical Assistance
      </h1>
      <Agent userName="John Doe" userId="12345" type="generate" />
    </div>
  );
}
