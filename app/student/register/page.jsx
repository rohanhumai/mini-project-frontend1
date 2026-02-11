"use client";
// Marks this component as a Client Component in Next.js (needed for hooks, state, browser APIs)

import { useState, useEffect } from "react";
// React hooks for state management and lifecycle behavior

import { useRouter } from "next/navigation";
// Next.js router for programmatic navigation

import Link from "next/link";
// Next.js Link component for client-side routing

import axios from "axios";
// HTTP client for making API requests

import toast from "react-hot-toast";
// Toast notification library

// API base URL (from environment variable, fallback to localhost)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StudentRegister() {
  const router = useRouter();
  // Router instance for navigation

  const [loading, setLoading] = useState(false);
  // Controls loading state of submit button

  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
    department: "",
    year: "1",
    section: "",
  });
  // Stores all form input values

  // Redirect to scan page if student already logged in
  useEffect(() => {
    if (localStorage.getItem("studentToken")) router.push("/student/scan");
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Enable loading state

    try {
      // Send registration request to backend
      const res = await axios.post(`${API}/auth/student/register`, {
        ...form,
        year: parseInt(form.year),
        // Convert year from string to number before sending
      });

      if (res.data.success) {
        // Store JWT token in localStorage
        localStorage.setItem("studentToken", res.data.token);

        // Store student data in localStorage
        localStorage.setItem("studentData", JSON.stringify(res.data.student));

        toast.success(res.data.message);
        // Show success notification

        router.push("/student/scan");
        // Navigate to scan page
      }
    } catch (err) {
      // Show error toast (fallback if no backend message)
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
      // Disable loading state
    }
  };

  // Reusable Tailwind input class string
  const ic =
    "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        {/* Logo / Home Link */}
        <Link
          href="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-2"
        >
          <span className="text-2xl">📋</span>QR Attendance
        </Link>

        {/* Teacher Login button */}
        <Link
          href="/teacher/login"
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Teacher Login
        </Link>
      </nav>

      {/* Main content container */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Card container */}
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
            {/* Header section */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">
                Student Registration
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Fill details to mark attendance
              </p>
            </div>

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={ic}
                  required
                />
              </div>

              {/* Roll Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="CS2024001"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm({ ...form, rollNumber: e.target.value })
                  }
                  className={ic}
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={ic}
                  required
                />
              </div>

              {/* Department + Year */}
              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className={ic}
                    required
                  >
                    <option value="">Select</option>
                    {[
                      "Computer Science",
                      "Electronics",
                      "Mechanical",
                      "Civil",
                      "Electrical",
                      "IT",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year *
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={ic}
                    required
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Section Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  placeholder="A, B, C (optional)"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                  className={ic}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    {/* Loading spinner SVG */}
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "✅ Register & Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
