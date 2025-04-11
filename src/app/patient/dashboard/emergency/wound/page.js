"use client";
import { useState, useRef } from "react";
import * as ort from "onnxruntime-web";
import { AlertTriangle, Upload, Loader, AlertCircle, CheckCircle, Info } from "lucide-react";

const classLabels = [
  "Abrasions",
  "Bruises",
  "Burns",
  "Cut",
  "Ingrown nails",
  "Laceration",
  "Stab wound",
];

// Wound information and treatment guidelines
const woundInfo = {
  "Abrasions": {
    description: "Superficial wound where skin is scraped or rubbed away",
    treatment: "Clean with mild soap and water, apply antibiotic ointment, cover with sterile bandage",
    severity: "mild",
    color: "#10b981", // green
  },
  "Bruises": {
    description: "Blood vessels damaged beneath intact skin causing discoloration",
    treatment: "Apply ice for 20 minutes, rest and elevate affected area, take OTC pain medication if needed",
    severity: "mild",
    color: "#8b5cf6", // purple
  },
  "Burns": {
    description: "Tissue damage from heat, chemicals, electricity, or radiation",
    treatment: "Cool with running water (not ice), don't break blisters, apply aloe vera, cover loosely",
    severity: "moderate",
    color: "#f59e0b", // amber
  },
  "Cut": {
    description: "Clean wound with straight edges, typically from sharp object",
    treatment: "Apply pressure to stop bleeding, clean with water, close with butterfly bandage if small",
    severity: "moderate",
    color: "#3b82f6", // blue
  },
  "Ingrown nails": {
    description: "Nail growing into surrounding skin, causing pain and inflammation",
    treatment: "Soak in warm water with salt, gently lift nail edge, apply antibiotic ointment",
    severity: "mild",
    color: "#10b981", // green
  },
  "Laceration": {
    description: "Irregular tear-like wound with jagged edges",
    treatment: "Apply pressure to stop bleeding, clean thoroughly, may require stitches for deep wounds",
    severity: "moderate to severe",
    color: "#f59e0b", // amber
  },
  "Stab wound": {
    description: "Deep penetrating wound, potentially affecting internal organs",
    treatment: "Apply firm pressure, do NOT remove embedded objects, seek emergency care immediately",
    severity: "severe",
    color: "#ef4444", // red
  },
};

export default function WoundClassification() {
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
      console.log('Attempting to save:', {
        imageLength: imageBase64?.length,
        prediction,
        confidence
      });

      const response = await fetch('/api/wound-history', {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save history');
      }

      const data = await response.json();
      console.log('Save successful:', data);

    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const handleImage = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!file) return;

      const img = new Image();
      img.src = URL.createObjectURL(file);
      setImageUrl(img.src);

      img.onload = async () => {
        try {
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

          const canvas = canvasRef.current;
          const imageBase64 = canvas.toDataURL("image/png");
          await saveToHistory(imageBase64, classLabels[maxIndex], (output[maxIndex] * 100).toFixed(2));
        } catch (error) {
          console.error('Error processing image:', error);
          setError('Error processing image: ' + error.message);
        } finally {
          setIsLoading(false);
        }
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

  // Get severity level icon
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'severe':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'moderate':
      case 'moderate to severe':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'mild':
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <span className="text-blue-500 mr-2">🩹</span> Wound Classification
        </h1>
        <p className="text-gray-600">
          Upload an image of a wound to identify its type and get first aid recommendations
        </p>
      </div>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Classification Categories:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {classLabels.map((label) => (
              <div 
                key={label} 
                className="p-3 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${woundInfo[label].color}10`,
                  borderLeftColor: woundInfo[label].color
                }}
              >
                <p className="font-medium" style={{ color: woundInfo[label].color }}>{label}</p>
              </div>
            ))}
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
          <p className="text-gray-700">Analyzing wound image...</p>
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
              alt="Uploaded wound"
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
            style={{ backgroundColor: `${woundInfo[prediction].color}15` }}
          >
            <div 
              className="h-12 w-12 rounded-full mr-4 flex items-center justify-center"
              style={{ backgroundColor: `${woundInfo[prediction].color}30` }}
            >
              {getSeverityIcon(woundInfo[prediction].severity)}
            </div>
            <div>
              <h3 
                className="text-lg font-bold mb-1"
                style={{ color: woundInfo[prediction].color }}
              >
                {prediction}
              </h3>
              <p className="text-gray-600 text-sm">
                {woundInfo[prediction].description}
              </p>
            </div>
          </div>

          {/* Severity Alert for Severe Wounds */}
          {woundInfo[prediction].severity === "severe" && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 text-center animate-pulse">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-red-700">MEDICAL ATTENTION REQUIRED</h3>
              <p className="text-red-600">
                This wound type requires immediate professional medical care
              </p>
            </div>
          )}

          {/* Treatment Recommendations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💊</span> First Aid Recommendations
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {woundInfo[prediction].treatment.split(', ').map((step, index) => (
                <div key={index} className="flex items-start mb-2 last:mb-0">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

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
