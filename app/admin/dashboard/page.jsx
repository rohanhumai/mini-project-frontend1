"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [daily, setDaily] = useState([]);
  const [topSubjects, setTopSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [redis, setRedis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  const auth = useCallback(() => {
    const t = localStorage.getItem("adminToken");
    return { headers: { Authorization: `Bearer ${t}` } };
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    const d = localStorage.getItem("adminData");
    if (!t || !d) {
      router.push("/admin/login");
      return;
    }
    setAdmin(JSON.parse(d));
    loadAll();
  }, [router]);

  const loadAll = async () => {
    try {
      const [dashRes, studRes, teachRes, redisRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, auth()),
        axios.get(`${API}/admin/students?limit=100`, auth()),
        axios.get(`${API}/admin/teachers`, auth()),
        axios.get(`${API}/admin/redis`, auth()),
      ]);
      setStats(dashRes.data.stats);
      setRecent(dashRes.data.recentAttendance);
      setDaily(dashRes.data.dailyAttendance);
      setTopSubjects(dashRes.data.topSubjects);
      setStudents(studRes.data.students);
      setTeachers(teachRes.data.teachers);
      setRedis(redisRes.data.redis);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) router.push("/admin/login");
      setLoading(false);
    }
  };

  const resetDevice = async (id, name) => {
    if (!confirm(`Reset device for ${name}?`)) return;
    try {
      await axios.post(`${API}/admin/students/${id}/reset-device`, {}, auth());
      toast.success(`Device reset for ${name}`);
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const resetToken = async (id, name) => {
    try {
      await axios.post(`${API}/admin/students/${id}/reset-token`, {}, auth());
      toast.success(`Token reset for ${name}`);
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`${API}/admin/students/${id}/toggle-status`, {}, auth());
      toast.success("Status updated");
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`DELETE ${name}? This removes all their data.`)) return;
    try {
      await axios.delete(`${API}/admin/students/${id}`, auth());
      toast.success(`Deleted ${name}`);
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteTeacher = async (id, name) => {
    if (!confirm(`DELETE teacher ${name}?`)) return;
    try {
      await axios.delete(`${API}/admin/teachers/${id}`, auth());
      toast.success(`Deleted ${name}`);
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const flushRedis = async (type) => {
    if (!confirm(`Flush ${type} from Redis?`)) return;
    try {
      const res = await axios.post(
        `${API}/admin/redis/flush`,
        { type },
        auth(),
      );
      toast.success(res.data.message);
      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    );

  const filteredStudents = students.filter(
    (s) =>
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "students", label: `👨‍🎓 Students (${students.length})` },
    { id: "teachers", label: `🎓 Teachers (${teachers.length})` },
    { id: "redis", label: "⚡ Redis" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-red-950/50 backdrop-blur-md border-b border-red-900/30 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-bold text-red-400 flex items-center gap-2"
          >
            <span className="text-2xl">🛡️</span> Admin Panel
          </Link>
          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
            {admin?.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">
            {admin?.name}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {[
                {
                  label: "Students",
                  value: stats.totalStudents,
                  icon: "👨‍🎓",
                  color: "indigo",
                },
                {
                  label: "Teachers",
                  value: stats.totalTeachers,
                  icon: "🎓",
                  color: "cyan",
                },
                {
                  label: "Sessions",
                  value: stats.totalSessions,
                  icon: "📋",
                  color: "amber",
                },
                {
                  label: "Attendance",
                  value: stats.totalAttendance,
                  icon: "✅",
                  color: "emerald",
                },
                {
                  label: "Active Now",
                  value: stats.activeSessions,
                  icon: "🟢",
                  color: "green",
                },
                {
                  label: "Today",
                  value: stats.todayAttendance,
                  icon: "📅",
                  color: "blue",
                },
                {
                  label: "Devices",
                  value: stats.lockedDevices,
                  icon: "🔒",
                  color: "red",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-center"
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-100">
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top Subjects */}
            {topSubjects.length > 0 && (
              <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-gray-100 mb-4">
                  📚 Top Subjects
                </h3>
                <div className="space-y-3">
                  {topSubjects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{s._id}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{
                              width: `${(s.count / topSubjects[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-8 text-right">
                          {s.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-100 mb-4">
                🕐 Recent Activity
              </h3>
              {recent.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recent.map((r) => (
                    <div
                      key={r._id}
                      className="flex items-center justify-between p-3 bg-gray-950/50 rounded-xl border border-gray-800/30"
                    >
                      <div>
                        <p className="text-sm text-gray-100 font-medium">
                          {r.student?.name}{" "}
                          <span className="text-gray-400 font-mono text-xs">
                            ({r.student?.rollNumber})
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.session?.subject} • {r.teacher?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                          ✅
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(r.markedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* STUDENTS TAB */}
        {tab === "students" && (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Search by name, roll number, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              {filteredStudents.map((s) => (
                <div
                  key={s._id}
                  className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-bold text-gray-100">
                          {s.name}
                        </h4>
                        {!s.isActive && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">
                        {s.rollNumber} • {s.email} • {s.department} • Year{" "}
                        {s.year}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          ✅ {s.attendanceCount} attended
                        </span>
                        {s.deviceFingerprint && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            🔒 Device: {s.deviceFingerprint.substring(0, 8)}...
                          </span>
                        )}
                        {s.hasActiveCooldown && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⏳ Cooldown: {Math.ceil(s.tokenCooldown / 60)}m
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resetDevice(s._id, s.name)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
                      >
                        🔓 Reset Device
                      </button>
                      <button
                        onClick={() => resetToken(s._id, s.name)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
                      >
                        ⏳ Reset Token
                      </button>
                      <button
                        onClick={() => toggleStatus(s._id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${s.isActive ? "text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"}`}
                      >
                        {s.isActive ? "⏸ Disable" : "▶ Enable"}
                      </button>
                      <button
                        onClick={() => deleteStudent(s._id, s.name)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TEACHERS TAB */}
        {tab === "teachers" && (
          <div className="space-y-3">
            {teachers.map((t) => (
              <div
                key={t._id}
                className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h4 className="text-base font-bold text-gray-100">
                    {t.name}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {t.email} • {t.department}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Subjects: {t.subjects?.join(", ")}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      📋 {t.sessionCount} sessions
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✅ {t.attendanceCount} records
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTeacher(t._id, t.name)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* REDIS TAB */}
        {tab === "redis" && redis && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Keys", value: redis.totalKeys, color: "gray" },
                {
                  label: "Token Cooldowns",
                  value: redis.tokenCooldowns,
                  color: "amber",
                },
                {
                  label: "Device Locks",
                  value: redis.deviceLocks,
                  color: "red",
                },
                {
                  label: "Cached Sessions",
                  value: redis.cachedSessions,
                  color: "indigo",
                },
                {
                  label: "Rate Limits",
                  value: redis.rateLimitKeys,
                  color: "cyan",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-center"
                >
                  <div className="text-2xl font-bold text-gray-100">
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-gray-100 mb-4">
                🧹 Flush Redis Data
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    type: "tokens",
                    label: "⏳ Clear Token Cooldowns",
                    desc: "All students can scan again",
                  },
                  {
                    type: "devices",
                    label: "🔓 Clear Device Locks",
                    desc: "All students can use any device",
                  },
                  {
                    type: "sessions",
                    label: "📋 Clear Session Cache",
                    desc: "Sessions reload from DB",
                  },
                  {
                    type: "ratelimits",
                    label: "🚦 Clear Rate Limits",
                    desc: "Reset all rate limits",
                  },
                  {
                    type: "all",
                    label: "💥 Clear Everything",
                    desc: "Nuclear option",
                  },
                ].map((f) => (
                  <button
                    key={f.type}
                    onClick={() => flushRedis(f.type)}
                    className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all text-left ${f.type === "all" ? "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" : "text-gray-200 bg-gray-800 border-gray-700 hover:bg-gray-700"}`}
                  >
                    <div>{f.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Keys */}
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-100 mb-4">
                🔑 All Redis Keys ({redis.totalKeys})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {redis.allKeys.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No keys in Redis
                  </p>
                ) : (
                  redis.allKeys.map((key, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-gray-950/50 rounded-lg"
                    >
                      <code className="text-xs font-mono text-indigo-400">
                        {key}
                      </code>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
