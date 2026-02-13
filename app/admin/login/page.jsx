"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, form);
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminData", JSON.stringify(res.data.admin));
        toast.success("Admin login successful!");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const ic =
    "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all";

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-2"
        >
          <span className="text-2xl">📋</span> QR Attendance
        </Link>
      </nav>

      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="p-8 bg-gray-900/50 border border-red-500/20 rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">Admin Panel</h2>
              <p className="text-gray-400 text-sm mt-1">
                Authorized access only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={ic}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={ic}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {loading ? "Signing in..." : "🔐 Admin Login"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
              <p className="text-xs text-gray-400 text-center">
                <span className="font-semibold text-gray-300">Demo:</span>{" "}
                adminpanel@college.edu / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
