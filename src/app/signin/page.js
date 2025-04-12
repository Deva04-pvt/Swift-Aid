"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Mail, Activity } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.ok) {
        const session = await getSession();
        if (session?.user.role === "Doctor") router.push("/doctor/dashboard");
        else if (session?.user.role === "Patient")
          router.push("/patient/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 bg-teal-500 rounded-2xl shadow-lg opacity-30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-teal-400" />
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleLogin}
          variants={itemVariants}
          className="rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-gray-800/90"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400"
          >
            Welcome Back
          </motion.h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm flex items-center"
            >
              <span className="mr-2">⚠️</span> {error}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              className="group relative w-full bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-teal-500/10 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6 text-center">
          <p className="text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
