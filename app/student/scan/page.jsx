"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StudentScan() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [tokenStatus, setTokenStatus] = useState({
    hasToken: true,
    cooldownRemaining: 0,
  });
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const scannerRef = useRef(null);
  const qrRef = useRef(null);

  const headers = useCallback(() => {
    const token = localStorage.getItem("studentToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    const data = localStorage.getItem("studentData");
    if (!token || !data) {
      router.push("/student/register");
      return;
    }
    setStudent(JSON.parse(data));
    fetchTokenStatus();
    fetchHistory();
    setLoading(false);
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (tokenStatus.cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setTokenStatus((prev) => {
          const cd = prev.cooldownRemaining - 1;
          if (cd <= 0) return { hasToken: true, cooldownRemaining: 0 };
          return { ...prev, cooldownRemaining: cd };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tokenStatus.cooldownRemaining]);

  const fetchTokenStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/token-status`, headers());
      setTokenStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/attendance/my-attendance`,
        headers(),
      );
      setHistory(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startScanning = async () => {
    if (!tokenStatus.hasToken) {
      toast.error("No token available. Wait for cooldown.");
      return;
    }
    setScanning(true);
    setSuccess(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await new Promise((r) => setTimeout(r, 100));
      if (scannerRef.current) {
        const qr = new Html5Qrcode("qr-reader");
        qrRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (text) => {
            await handleScan(text);
            stopScanning();
          },
          () => {},
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not start camera. Check permissions.");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (qrRef.current) {
        await qrRef.current.stop();
        qrRef.current = null;
      }
    } catch (err) {
      console.error(err);
    }
    setScanning(false);
  };

  const handleScan = async (qrData) => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(qrData);
      } catch {
        toast.error("Invalid QR code");
        return;
      }
      if (!parsed.sessionCode) {
        toast.error("Invalid QR code format");
        return;
      }
      await markAttendance(parsed.sessionCode);
    } catch (err) {
      handleError(err);
    }
  };

  const markAttendance = async (sessionCode) => {
    const res = await axios.post(
      `${API_URL}/attendance/mark`,
      { sessionCode },
      headers(),
    );
    if (res.data.success) {
      setSuccess(res.data.attendance);
      toast.success("Attendance marked successfully! ✅");
      fetchTokenStatus();
      fetchHistory();
    }
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setManualLoading(true);
    try {
      await markAttendance(manualCode.trim());
      setManualCode("");
    } catch (err) {
      handleError(err);
    } finally {
      setManualLoading(false);
    }
  };

  const handleError = (err) => {
    toast.error(err.response?.data?.message || "Failed");
    if (err.response?.data?.cooldownRemaining) {
      setTokenStatus({
        hasToken: false,
        cooldownRemaining: err.response.data.cooldownRemaining,
      });
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec < 10 ? "0" : ""}${sec}s`;
  };

  const logout = () => {
    stopScanning();
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

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
          {/* Token Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              tokenStatus.hasToken
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {tokenStatus.hasToken
              ? "🟢 Token Ready"
              : `⏳ ${formatTime(tokenStatus.cooldownRemaining)}`}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">
            📱 Scan Attendance
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {student?.name} • {student?.rollNumber} • {student?.department}
          </p>
        </div>

        {/* Token Status */}
        <div
          className={`p-5 bg-gray-900/50 border rounded-2xl mb-6 border-l-4 ${
            tokenStatus.hasToken
              ? "border-gray-800 border-l-emerald-500"
              : "border-gray-800 border-l-amber-500"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-gray-100">Token Status</h4>
              <p className="text-gray-400 text-xs mt-1">
                {tokenStatus.hasToken
                  ? "You have a token. Scan a QR code to mark attendance."
                  : `Cooldown active. Next token in ${formatTime(tokenStatus.cooldownRemaining)}`}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                tokenStatus.hasToken ? "bg-emerald-500/10" : "bg-amber-500/10"
              }`}
            >
              {tokenStatus.hasToken ? "✅" : "⏳"}
            </div>
          </div>

          {/* Progress Bar */}
          {!tokenStatus.hasToken && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${((3600 - tokenStatus.cooldownRemaining) / 3600) * 100}%`,
                  }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2 text-right">
                {formatTime(tokenStatus.cooldownRemaining)} remaining
              </p>
            </div>
          )}
        </div>

        {/* Success */}
        {success && (
          <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl mb-6 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-emerald-400">
              Attendance Marked!
            </h3>
            <p className="text-gray-300 mt-2">
              Subject:{" "}
              <span className="text-gray-100 font-semibold">
                {success.subject}
              </span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Time: {new Date(success.markedAt).toLocaleTimeString()}
            </p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-6 px-6 py-2.5 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* Scanner */}
        {!success && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden mb-6">
            {!scanning ? (
              <div className="p-10 text-center">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">📷</span>
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">
                  Ready to Scan
                </h3>
                <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                  Point your camera at the QR code displayed by your teacher
                </p>
                <button
                  onClick={startScanning}
                  disabled={!tokenStatus.hasToken}
                  className={`px-8 py-4 text-base font-semibold rounded-2xl transition-all ${
                    tokenStatus.hasToken
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"
                  }`}
                >
                  {tokenStatus.hasToken
                    ? "📱 Start Scanning"
                    : "⏳ Token Cooldown Active"}
                </button>
              </div>
            ) : (
              <div>
                <div id="qr-reader" ref={scannerRef} className="w-full" />
                <div className="p-4">
                  <button
                    onClick={stopScanning}
                    className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
                  >
                    ⏹ Stop Scanner
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {!success && !scanning && tokenStatus.hasToken && (
          <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Or enter session code manually
            </h4>
            <form onSubmit={handleManual} className="flex gap-3">
              <input
                type="text"
                placeholder="Paste session code here"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={manualLoading}
                className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {manualLoading ? "..." : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* History */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all"
          >
            <span className="text-sm font-semibold text-gray-200">
              📚 Attendance History ({history.length})
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                showHistory ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showHistory && (
            <div className="mt-2 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">
                    No attendance records yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((r) => (
                    <div
                      key={r._id}
                      className="flex items-center justify-between p-4 bg-gray-950/50 rounded-xl border border-gray-800/30"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-100">
                          {r.subject}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {r.teacher?.name} •{" "}
                          {new Date(r.markedAt).toLocaleDateString()}{" "}
                          {new Date(r.markedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✅ {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
