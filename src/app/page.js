"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LogoutButton from "@/components/LogoutButton";
import { ArrowRight, Activity, User, Shield } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRedirect = () => {
    setLoading(true);
    if (!session) return router.push("/signin");
    if (session.user.role === "Doctor") router.push("/doctor/dashboard");
    else if (session.user.role === "Patient") router.push("/patient/dashboard");
  };

  useEffect(() => {
    // Add smooth page transition when component mounts
    const body = document.querySelector("body");
    body.classList.add("page-loaded");

    return () => body.classList.remove("page-loaded");
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <motion.div
        className="flex flex-col items-center justify-center px-6 py-16 md:py-24 max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo Animation */}
        <motion.div className="w-24 h-24 mb-6 relative" variants={itemVariants}>
          <div className="absolute inset-0 bg-blue-500 rounded-2xl shadow-lg opacity-20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
          variants={itemVariants}
        >
          Swift-Aid
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-gray-700 mb-12 max-w-lg"
          variants={itemVariants}
        >
          A secure healthcare platform connecting doctors and patients for
          streamlined care management.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl"
          variants={itemVariants}
        >
          <FeatureCard
            icon={<Activity className="w-8 h-8 text-blue-600" />}
            title="Real-time Updates"
            description="Get instant notifications about appointments and medical records"
          />
          <FeatureCard
            icon={<User className="w-8 h-8 text-blue-600" />}
            title="Role-Based Access"
            description="Customized dashboards for doctors and patients"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-600" />}
            title="Secure & Private"
            description="End-to-end encryption for all your sensitive health data"
          />
        </motion.div>

        {/* Button Group */}
        <motion.div
          className="flex flex-col md:flex-row gap-4"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleRedirect}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-blue-300/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  {session ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>

        {/* Status badge */}
        {session && (
          <motion.div
            className="mt-8 px-4 py-2 bg-white rounded-full shadow-md"
            variants={itemVariants}
            animate={{
              y: [0, -5, 0],
              transition: { repeat: Infinity, duration: 2 },
            }}
          >
            <p className="text-sm text-gray-600">
              Signed in as{" "}
              <span className="font-semibold text-blue-600">
                {session.user.role}
              </span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Floating animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </main>
  );
}

// Feature card component
function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="mb-4 p-3 inline-block bg-blue-50 rounded-lg">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
