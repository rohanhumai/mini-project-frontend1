"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function TeacherLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/teacher/login`, form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("teacherData", JSON.stringify(res.data.teacher));
        toast.success("Login successful!");
        router.push("/teacher/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-2"
        >
          <span className="text-2xl">📋</span>
          QR Attendance
        </Link>
        <Link
          href="/student/register"
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Student Register
        </Link>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">
                Teacher Login
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Sign in to manage attendance sessions
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="teacher@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Demo */}
            <div className="mt-6 p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
              <p className="text-xs text-gray-400 text-center">
                <span className="font-semibold text-gray-300">Demo:</span>{" "}
                admin@college.edu / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
