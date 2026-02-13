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
            href="/login"
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
      <div className="max-w-5xl mx-auto px-6 text-center py-20">
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

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
          Teachers generate QR codes for sessions. Students scan to mark
          attendance. Each student gets{" "}
          <span className="text-amber-400 font-semibold">1 token per hour</span>{" "}
          and is{" "}
          <span className="text-red-400 font-semibold">
            locked to one device
          </span>{" "}
          — no more proxy!
        </p>

        {/* Two Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
          {/* Teacher Card */}
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Teacher</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Generate QR codes, create attendance sessions, and track student
              attendance in real-time.
            </p>
            <ul className="text-left text-gray-400 text-sm space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Generate QR codes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 1 minute QR expiry
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> View attendance list
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Manage sessions
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full px-6 py-3.5 text-center font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
            >
              Teacher Login →
            </Link>
          </div>

          {/* Student Card */}
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">📱</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Student</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Register once, scan QR codes to mark your attendance. Your account
              is locked to your device.
            </p>
            <ul className="text-left text-gray-400 text-sm space-y-2 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Scan QR to mark
                attendance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">⏳</span> 1 token per hour
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">🔒</span> Locked to one device
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> View attendance
                history
              </li>
            </ul>
            <Link
              href="/student/register"
              className="block w-full px-6 py-3.5 text-center font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-600/20 transition-all"
            >
              Student Register →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: "📱",
              title: "QR Scanning",
              desc: "Scan QR codes to mark attendance instantly.",
            },
            {
              icon: "🔒",
              title: "Device Lock",
              desc: "Each account locked to one device only.",
            },
            {
              icon: "⏳",
              title: "Token System",
              desc: "1 scan per hour prevents proxy attendance.",
            },
            {
              icon: "⚡",
              title: "Redis Powered",
              desc: "Fast caching and DDoS rate limiting.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 bg-gray-900/30 border border-gray-800/50 rounded-2xl text-center hover:border-gray-700 transition-all duration-300 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-gray-100 mb-1">
                {f.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-100 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Teacher Creates Session",
                desc: "Teacher selects subject and generates a QR code that expires in 1 minute.",
                color: "indigo",
              },
              {
                step: "2",
                title: "Student Scans QR",
                desc: "Student opens scanner and scans the QR code displayed by the teacher.",
                color: "cyan",
              },
              {
                step: "3",
                title: "Attendance Marked",
                desc: "System verifies device, checks token, and marks student as present.",
                color: "emerald",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="p-6 bg-gray-900/30 border border-gray-800/50 rounded-2xl text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-${s.color}-500/20 text-${s.color}-400 flex items-center justify-center mx-auto mb-4 text-lg font-bold`}
                >
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-gray-100 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-4">
              🛡️ Anti-Proxy Security
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    Device Locking
                  </p>
                  <p className="text-xs text-gray-400">
                    Account locked to first device used. Cannot login from
                    another device.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5">⏳</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    Token Cooldown
                  </p>
                  <p className="text-xs text-gray-400">
                    Only 1 scan allowed per hour. Prevents rapid proxy scanning.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    QR Expiry
                  </p>
                  <p className="text-xs text-gray-400">
                    QR codes expire in 1 minute. Must be scanned quickly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 mt-0.5">🚫</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    Rate Limiting
                  </p>
                  <p className="text-xs text-gray-400">
                    Redis-powered rate limiting prevents DDoS and spam requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="max-w-md mx-auto mb-16">
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
            <p className="text-gray-600 text-xs mt-3">
              Run{" "}
              <code className="bg-gray-900 px-2 py-0.5 rounded font-mono">
                npm run seed
              </code>{" "}
              in backend first
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-8 pb-12">
          <p className="text-gray-600 text-sm">
            Built with Node.js • MongoDB • Redis • Next.js • Tailwind CSS
          </p>
          <p className="text-gray-700 text-xs mt-2">
            College Mini Project — QR Attendance System
          </p>
        </div>
      </div>
    </div>
  );
}
