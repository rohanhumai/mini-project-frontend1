"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [activeQR, setActiveQR] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("active");
  const [form, setForm] = useState({
    subject: "",
    department: "",
    year: "",
    section: "",
    expiryMinutes: 5,
  });

  const headers = useCallback(() => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const data = localStorage.getItem("teacherData");
    if (!token || !data) {
      router.push("/teacher/login");
      return;
    }
    setTeacher(JSON.parse(data));
    fetchActive();
    fetchAll();
    setLoading(false);
  }, [router]);

  const fetchActive = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/teacher/sessions/active`,
        headers(),
      );
      setSessions(res.data.sessions || []);
    } catch (err) {
      if (err.response?.status === 401) router.push("/teacher/login");
    }
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/teacher/sessions/all`, headers());
      setAllSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_URL}/teacher/session`,
        {
          ...form,
          department: form.department || teacher.department,
          year: form.year ? parseInt(form.year) : undefined,
          expiryMinutes: parseInt(form.expiryMinutes),
        },
        headers(),
      );
      if (res.data.success) {
        setActiveQR(res.data.session);
        toast.success("Session created! QR code generated.");
        setShowForm(false);
        setForm({
          subject: "",
          department: "",
          year: "",
          section: "",
          expiryMinutes: 5,
        });
        fetchActive();
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const endSession = async (id) => {
    try {
      await axios.put(`${API_URL}/teacher/session/${id}/end`, {}, headers());
      toast.success("Session ended");
      setActiveQR(null);
      fetchActive();
      fetchAll();
    } catch (err) {
      toast.error("Failed to end session");
    }
  };

  const viewAttendance = async (id) => {
    try {
      const res = await axios.get(
        `${API_URL}/teacher/session/${id}/attendance`,
        headers(),
      );
      setAttendance(res.data.attendance || []);
      setSelectedSession(id);
    } catch (err) {
      toast.error("Failed to fetch attendance");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherData");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentSessions = tab === "active" ? sessions : allSessions;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-2"
        >
          <span className="text-2xl">📋</span>
          QR Attendance
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">
            👋 {teacher?.name}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            Teacher Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {teacher?.department} • {teacher?.subjects?.join(", ")}
          </p>
        </div>

        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all mb-8"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Session
          </button>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-gray-100 mb-6">
              Create New Attendance Session
            </h3>
            <form onSubmit={createSession}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  >
                    <option value="">Select Subject</option>
                    {teacher?.subjects?.map((sub, i) => (
                      <option key={i} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder={teacher?.department}
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., A, B, C"
                    value={form.section}
                    onChange={(e) =>
                      setForm({ ...form, section: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Expiry
                  </label>
                  <select
                    value={form.expiryMinutes}
                    onChange={(e) =>
                      setForm({ ...form, expiryMinutes: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  >
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creating ? (
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
                      Creating...
                    </>
                  ) : (
                    "🔄 Generate QR Code"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-200 bg-gray-800 border border-gray-700 font-semibold rounded-xl hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Code Display */}
        {activeQR && (
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-8">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-100 mb-2">
                📱 Current QR Code
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Subject:{" "}
                <span className="text-indigo-400 font-semibold">
                  {activeQR.subject}
                </span>
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-indigo-600/10 mb-4">
                <img
                  src={activeQR.qrImage}
                  alt="QR Code"
                  className="w-72 h-72"
                />
              </div>

              {/* Session Code for manual entry */}
              <div className="w-full max-w-md mt-2 mb-4">
                <p className="text-gray-500 text-xs mb-2">
                  Session Code (for manual entry):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-indigo-400 text-xs font-mono break-all">
                    {activeQR.sessionCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeQR.sessionCode);
                      toast.success("Copied!");
                    }}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-all text-sm"
                  >
                    📋
                  </button>
                </div>
              </div>

              <p className="text-gray-500 text-xs mb-6">
                Expires at: {new Date(activeQR.expiresAt).toLocaleTimeString()}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => viewAttendance(activeQR.id)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
                >
                  📊 View Attendance
                </button>
                <button
                  onClick={() => endSession(activeQR.id)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"
                >
                  ⏹ End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setTab("active");
              setSelectedSession(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "active"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            Active Sessions ({sessions.length})
          </button>
          <button
            onClick={() => {
              setTab("history");
              setSelectedSession(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "history"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            All Sessions ({allSessions.length})
          </button>
        </div>

        {/* Sessions */}
        <div className="space-y-4">
          {currentSessions.length === 0 ? (
            <div className="p-12 bg-gray-900/50 border border-gray-800 rounded-2xl text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-400 text-sm">
                Create a new session to generate a QR code
              </p>
            </div>
          ) : (
            currentSessions.map((s) => {
              const isActive = s.isActive && new Date(s.expiresAt) > new Date();
              return (
                <div
                  key={s._id}
                  className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-all"
                >
                  <div>
                    <h4 className="text-base font-bold text-gray-100">
                      {s.subject}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      {s.department} •{" "}
                      {new Date(s.createdAt).toLocaleDateString()}{" "}
                      {new Date(s.createdAt).toLocaleTimeString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {isActive ? "🟢 Active" : "🔴 Ended"}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        👥 {s.attendanceCount || 0} present
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewAttendance(s._id)}
                      className="px-4 py-2 text-xs font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
                    >
                      📋 Attendance
                    </button>
                    {isActive && (
                      <button
                        onClick={() => endSession(s._id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Attendance Table */}
        {selectedSession && (
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-100">
                📊 Attendance List ({attendance.length} students)
              </h3>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setAttendance([]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
              >
                ✕ Close
              </button>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No attendance recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {[
                        "#",
                        "Name",
                        "Roll No",
                        "Dept",
                        "Year",
                        "Time",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((r, i) => (
                      <tr
                        key={r._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {i + 1}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-100 font-medium">
                          {r.student?.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300 font-mono">
                          {r.student?.rollNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {r.student?.department}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {r.student?.year}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {new Date(r.markedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✅ {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
