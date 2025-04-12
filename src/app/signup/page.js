"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Activity,
  UserCheck,
  ChevronDown,
} from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Patient",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/signin");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-0 w-56 h-56 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 bg-teal-500 rounded-2xl shadow-lg opacity-30 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-teal-400" />
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-gray-800/90"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400"
          >
            Create Your Account
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

          <motion.div variants={itemVariants} className="space-y-5">
            <div className="flex gap-4">
              <div className="w-1/2 relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="w-1/2 relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <UserCheck
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <div className="relative">
                <select
                  className="w-full pl-10 pr-8 py-3 border border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:bg-gray-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all duration-200 appearance-none"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <div className="pt-4">
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
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </div>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
