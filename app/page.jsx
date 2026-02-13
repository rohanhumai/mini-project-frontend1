"use client";

import Link from "next/link";

export default function Home() {
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
          <Link
            href="/teacher/login"
            className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
          >
            Teacher Login
          </Link>
          <Link
            href="/student/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all"
          >
            Student Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Anti-Proxy Attendance System
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Smart QR
          </span>
          <br />
          <span className="text-gray-100">Attendance System</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Teachers generate QR codes for sessions. Students scan to mark
          attendance. Each student gets{" "}
          <span className="text-amber-400 font-semibold">1 token per hour</span>{" "}
          — no more proxy!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/teacher/login"
            className="px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all"
          >
            🎓 I&apos;m a Teacher
          </Link>
          <Link
            href="/student/register"
            className="px-8 py-4 text-base font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-700 transition-all"
          >
            📱 I&apos;m a Student
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "📱",
              title: "QR Scanning",
              desc: "Scan QR codes to mark attendance instantly.",
            },
            {
              icon: "🔒",
              title: "Anti-Proxy",
              desc: "1 token per hour prevents proxy attendance.",
            },
            {
              icon: "⚡",
              title: "Redis Powered",
              desc: "Fast caching and DDoS rate limiting.",
            },
            {
              icon: "📊",
              title: "Real-time",
              desc: "Live attendance tracking for teachers.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl text-center hover:border-indigo-500/30 transition-all duration-300 group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo */}
        <div className="max-w-md mx-auto mt-16">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-gray-100 mb-3">
              🔑 Demo Credentials
            </h3>
            <div className="bg-gray-950 rounded-xl p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                Email:{" "}
                <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                  admin@college.edu
                </code>
              </p>
              <p className="text-gray-300 text-sm">
                Password:{" "}
                <code className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                  admin123
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
