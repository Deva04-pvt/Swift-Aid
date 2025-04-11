"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import * as ort from "onnxruntime-web";
import { AlertTriangle, Upload, Loader, AlertCircle, CheckCircle, Video } from "lucide-react";

const classLabels = ["Mild Burn", "Moderate Burn", "Severe Burn"];

const treatmentMap = {
  "Mild Burn": {
    text: `- Cool the burn with cool water for 10-15 minutes.\n- Apply aloe vera or moisturizing lotion.\n- Use pain relievers like ibuprofen.\n- Cover with a sterile bandage.`,
    video: "/videos/first.mp4",
    color: "#10b981", // green
  },
  "Moderate Burn": {
    text: `- Cool with water for at least 10 minutes.\n- Do not pop blisters.\n- Apply antibiotic ointment & bandage.\n- Take pain relievers.`,
    video: "/videos/second.mp4",
    color: "#f59e0b", // amber
  },
  "Severe Burn": {
    text: `- Call emergency services immediately.\n- Do not remove clothing stuck to the burn.\n- Cover with a clean cloth.\n- Elevate burn if possible.`,
    video: null, // no video for severe burn
    color: "#ef4444", // red
  },
};

export default function BurnClassification() {
  const { data: session } = useSession();
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef();
  const fileInputRef = useRef();

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
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleImage = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
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

            // Save to history if we have a session
            if (session?.user?.id) {
              await saveToHistory(base64Image, predictionResult, confidenceResult);
            }
          } catch (error) {
            console.error('Error processing image:', error);
            setError('Error processing image: ' + error.message);
          } finally {
            setIsLoading(false);
          }
        };
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImage(e.target.files[0]);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <span className="text-red-500 mr-2">🔥</span> Burn Classification
        </h1>
        <p className="text-gray-600">
          Upload an image of a burn wound to classify its severity and get first aid recommendations
        </p>
      </div>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Classification Categories:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
              <p className="font-medium text-green-700">Mild Burn</p>
              <p className="text-sm text-green-600">First-degree</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
              <p className="font-medium text-yellow-700">Moderate Burn</p>
              <p className="text-sm text-yellow-600">Second-degree</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
              <p className="font-medium text-red-700">Severe Burn</p>
              <p className="text-sm text-red-600">Third-degree or worse</p>
            </div>
          </div>
        </div>

        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 
            flex flex-col items-center justify-center
            transition-all duration-300 cursor-pointer
            ${dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="h-12 w-12 text-blue-500 mb-4" />
          <p className="text-gray-700 font-medium mb-2 text-center">
            Drag & Drop or Click to Upload
          </p>
          <p className="text-gray-500 text-sm text-center">
            Supported formats: JPG, PNG, WEBP
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <canvas ref={canvasRef} width="224" height="224" style={{ display: "none" }} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-700">Analyzing burn image...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-5 rounded-xl shadow-sm mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 mb-1">Error Processing Image</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Uploaded Image */}
      {imageUrl && !isLoading && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Image</h2>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Uploaded burn"
              className="max-w-full max-h-[300px] rounded-lg shadow-sm object-contain"
            />
          </div>
        </div>
      )}

      {/* Results Section */}
      {prediction && !isLoading && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Classification Result</h2>
            </div>
            <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
              {confidence}% confidence
            </div>
          </div>

          {/* Prediction Display */}
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center`}
            style={{ backgroundColor: `${treatmentMap[prediction].color}15` }}
          >
            <div 
              className="h-12 w-12 rounded-full mr-4 flex items-center justify-center"
              style={{ backgroundColor: `${treatmentMap[prediction].color}30` }}
            >
              <span className="text-2xl">
                {prediction === "Mild Burn" ? "🔥" : 
                 prediction === "Moderate Burn" ? "🔥🔥" : "🔥🔥🔥"}
              </span>
            </div>
            <div>
              <h3 
                className="text-lg font-bold mb-1"
                style={{ color: treatmentMap[prediction].color }}
              >
                {prediction}
              </h3>
              <p className="text-gray-600 text-sm">
                {prediction === "Mild Burn" 
                  ? "First-degree burn affecting the outer layer of skin" 
                  : prediction === "Moderate Burn"
                  ? "Second-degree burn affecting outer and underlying layers of skin"
                  : "Third-degree burn affecting deep tissues - medical emergency"}
              </p>
            </div>
          </div>

          {/* Emergency Alert for Severe Burns */}
          {prediction === "Severe Burn" && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 text-center animate-pulse">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-red-700">MEDICAL EMERGENCY</h3>
              <p className="text-red-600">
                Seek immediate professional medical attention for severe burns
              </p>
            </div>
          )}

          {/* Treatment Recommendations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💊</span> First Aid Recommendations
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {treatmentMap[prediction].text.split('\n').map((line, index) => (
                <div key={index} className="flex items-start mb-2 last:mb-0">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{line.substring(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Video */}
          {treatmentMap[prediction]?.video && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Video className="h-5 w-5 mr-2" /> Treatment Video
              </h3>
              <div className="rounded-lg overflow-hidden shadow-sm">
                <video controls className="w-full">
                  <source src={treatmentMap[prediction].video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">Important Note:</p>
            <p>This AI assessment is not a substitute for professional medical advice. When in doubt, always consult a healthcare professional.</p>
          </div>
        </div>
      )}
    </div>
  );
}
