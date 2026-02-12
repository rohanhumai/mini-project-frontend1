"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { getFingerprint, getRegisterHeaders } from "../../utils/fingerprint";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StudentRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fp, setFp] = useState(null);
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    email: "",
    department: "",
    year: "1",
    section: "",
  });

  useEffect(() => {
    if (localStorage.getItem("studentToken")) router.push("/student/scan");
    getFingerprint().then(setFp);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = await getRegisterHeaders();
      const res = await axios.post(
        `${API}/auth/student/register`,
        { ...form, year: parseInt(form.year) },
        headers,
      );
      if (res.data.success) {
        localStorage.setItem("studentToken", res.data.token);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));
        toast.success(res.data.message);
        router.push("/student/scan");
      }
    } catch (err) {
      if (err.response?.data?.deviceLocked) {
        toast.error(
          "❌ This account is locked to another device! Contact admin.",
          { duration: 6000 },
        );
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const ic =
    "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all";
  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "IT",
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-2"
        >
          <span className="text-2xl">📋</span> QR Attendance
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Teacher Login
        </Link>
      </nav>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl">
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
              {fp && (
                <p className="text-gray-600 text-xs mt-2">
                  🔒 Device: {fp.substring(0, 8)}...
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="grid grid-cols-2 gap-4">
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
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
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

            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400 text-center">
                🔒 Your account will be locked to this device. You cannot login
                from another device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
