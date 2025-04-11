"use client";
import { useState, useRef } from "react";
import * as ort from "onnxruntime-web";

const classLabels = [
  "Abrasions",
  "Bruises",
  "Burns",
  "Cut",
  "Ingrown nails",
  "Laceration",
  "Stab wound",
];

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    setImageUrl(img.src);

    img.onload = async () => {
      const inputTensor = await preprocess(img);
      const session = await ort.InferenceSession.create(
        "/wound_classification_model.onnx"
      );
      const feeds = { input_image: inputTensor };

      const results = await session.run(feeds);
      const output = results[Object.keys(results)[0]].data;

      const maxIndex = output.indexOf(Math.max(...output));
      setPrediction(classLabels[maxIndex]);
      setConfidence((output[maxIndex] * 100).toFixed(2));
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Wound Classification
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Upload an image of a wound to classify it using an ONNX model
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-6"
        />

        <canvas ref={canvasRef} width="224" height="224" className="hidden" />

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-lg mx-auto mb-6 max-h-64 object-contain"
          />
        )}

        {prediction && (
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold text-green-600">
              ✅ Prediction: {prediction}
            </h2>
            <p className="text-gray-700 mt-2">🧠 Confidence: {confidence}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
