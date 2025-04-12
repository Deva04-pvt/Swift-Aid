# Swift-Aid: AI-Powered Emergency Medical Response Platform

Swift-Aid is a comprehensive healthcare platform that combines artificial intelligence, real-time monitoring, and emergency response capabilities to provide immediate medical assistance and continuous health tracking.

## Key Features

### 1. Emergency Response System

- **AI-Powered Wound Classification**: Instant analysis and first-aid recommendations for various wound types
- **Burn Assessment**: AI-driven burn severity classification with treatment guidelines
- **Voice-Based Medical Assistant**: Interactive AI assistant for emergency medical guidance
- **Smart SOS System**: One-click emergency alert system with:
  - Real-time location sharing
  - QR code generation with vital medical information
  - Automatic emergency contact notification
  - Integration with Exotel for emergency calls

### 2. Real-Time Health Monitoring

- **Vital Signs Tracking**: Integration with Mi Band 5 for continuous heart rate monitoring
- **Health Dashboard**: Real-time visualization of vital statistics
- **MQTT-Based Data Stream**: Live health data transmission and monitoring
- **Automated Alerts**: Instant notifications for abnormal vital signs

### 3. Patient Care Management

- **Digital Medical Profile**: Comprehensive medical history management
- **Hospital Locator**: GPS-based nearby hospital search with specialty filtering
- **Treatment History**: Chronological record of medical assessments and treatments
- **Secure Data Storage**: End-to-end encrypted medical information storage

### 4. Doctor-Patient Interface

- **Remote Patient Monitoring**: Real-time patient vital monitoring for doctors
- **Status Tracking**: Patient health status classification and monitoring
- **Medical History Access**: Secure access to patient records and treatment history

## Technical Stack

- **Frontend & API**: Next.js 14
- **Database**: MongoDB
- **Real-time Communication**: MQTT
- **AI Models**: TensorFlow/ONNX
- **Image Management**: Cloudinary
- **Authentication**: NextAuth.js
- **Emergency Calls**: Exotel API

## Getting Started

### Prerequisites

```bash
Node.js 18+
npm or yarn
MongoDB
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Swift-Aid.git

# Navigate to project directory
cd Swift-Aid

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

## 📝 Environment Variables

Create a `.env.local` file with:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
CLOUDINARY_API_KEY=your_key
EXOTEL_SID=your_sid
# ... other variables
```
