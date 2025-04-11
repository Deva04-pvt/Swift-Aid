"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import * as ort from "onnxruntime-web";

const classLabels = ["Mild Burn", "Moderate Burn", "Severe Burn"];

export default function Home() {
  const { data: session } = useSession();
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef();

  const preprocess = async (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224).data;

    const input = new Float32Array(1 * 224 * 224 * 3);
    for (let i = 0; i < imageData.length; i += 4) {
      const idx = i / 4;
      input[idx * 3] = imageData[i] / 255;
      input[idx * 3 + 1] = imageData[i + 1] / 255;
      input[idx * 3 + 2] = imageData[i + 2] / 255;
    }

    return new ort.Tensor("float32", input, [1, 224, 224, 3]);
  };

  const saveToHistory = async (imageBase64, prediction, confidence) => {
    try {
      console.log('Saving to history:', {
        imageLength: imageBase64.length,
        prediction,
        confidence
      });

      const response = await fetch('/api/burn-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          prediction,
          confidence,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save history');
      }

      console.log('History saved successfully:', data);
    } catch (error) {
      console.error('Error saving history:', error);
      setError(error.message);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setIsLoading(true);
      setError(null);
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const img = new Image();
        img.src = URL.createObjectURL(file);
        setImageUrl(img.src);

        img.onload = async () => {
          try {
            const inputTensor = await preprocess(img);
            const session = await ort.InferenceSession.create(
              "/burn_classification_model.onnx"
            );

            const feeds = { input_image: inputTensor };
            const results = await session.run(feeds);
            const output = results[Object.keys(results)[0]].data;
            const maxIndex = output.indexOf(Math.max(...output));
            const predictionResult = classLabels[maxIndex];
            const confidenceResult = (output[maxIndex] * 100).toFixed(2);

            setPrediction(predictionResult);
            setConfidence(confidenceResult);

            await saveToHistory(base64Image, predictionResult, confidenceResult);
          } catch (error) {
            console.error('Error processing image:', error);
            setError('Error processing image: ' + error.message);
          }
        };
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fefefe",
        padding: "2rem",
        fontFamily: "'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: "#d9534f", fontSize: "2rem" }}>
        🔥 Burn Classification
      </h1>
      <p
        style={{ textAlign: "center", maxWidth: "500px", marginBottom: "1rem" }}
      >
        Upload an image of a burn wound to classify its severity into one of the
        following categories:
      </p>
      <ul style={{ listStyleType: "circle", paddingLeft: "1.5rem" }}>
        <li>Mild Burn</li>
        <li>Moderate Burn</li>
        <li>Severe Burn</li>
      </ul>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{
          marginTop: "1.5rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          border: "2px solid #ccc",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseOver={(e) => (e.target.style.borderColor = "#d9534f")}
        onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
      />

      <canvas
        ref={canvasRef}
        width="224"
        height="224"
        style={{ display: "none" }}
      />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded burn"
          style={{
            marginTop: "2rem",
            maxWidth: "90%",
            maxHeight: "300px",
            borderRadius: "12px",
            border: "1px solid #eee",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            objectFit: "cover",
          }}
        />
      )}

      {isLoading && (
        <div
          style={{
            marginTop: "1rem",
            color: "#d9534f",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          Processing image...
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "1rem",
            color: "#dc3545",
            fontSize: "1.1rem",
            textAlign: "center",
            padding: "1rem",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {prediction && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#28a745" }}>
            ✅ Prediction: {prediction}
          </h2>
          <p style={{ fontSize: "1.1rem", marginTop: "0.5rem", color: "#555" }}>
            🧠 Confidence: {confidence}%
          </p>
        </div>
      )}
    </div>
  );
}
