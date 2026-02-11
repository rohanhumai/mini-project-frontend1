import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function StudentScan() {
  const navigate = useNavigate();
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

  const auth = useCallback(() => {
    const t = localStorage.getItem("studentToken");
    return { headers: { Authorization: `Bearer ${t}` } };
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("studentToken");
    const d = localStorage.getItem("studentData");
    if (!t || !d) {
      navigate("/student/register");
      return;
    }
    setStudent(JSON.parse(d));
    fetchToken();
    fetchHistory();
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (tokenStatus.cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setTokenStatus((p) => {
          const cd = p.cooldownRemaining - 1;
          return cd <= 0
            ? { hasToken: true, cooldownRemaining: 0 }
            : { ...p, cooldownRemaining: cd };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tokenStatus.cooldownRemaining]);

  const fetchToken = async () => {
    try {
      const res = await axios.get(`${API}/student/token-status`, auth());
      setTokenStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/attendance/my-attendance`, auth());
      setHistory(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startScanning = async () => {
    if (!tokenStatus.hasToken) {
      toast.error("No token. Wait for cooldown.");
      return;
    }
    setScanning(true);
    setSuccess(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await new Promise((r) => setTimeout(r, 200));
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
      toast.error("Camera error.");
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
        toast.error("Invalid QR");
        return;
      }
      if (!parsed.sessionCode) {
        toast.error("Invalid QR format");
        return;
      }
      await markAttendance(parsed.sessionCode);
    } catch (err) {
      handleErr(err);
    }
  };

  const markAttendance = async (code) => {
    const res = await axios.post(
      `${API}/attendance/mark`,
      { sessionCode: code },
      auth(),
    );
    if (res.data.success) {
      setSuccess(res.data.attendance);
      toast.success("Attendance marked! ✅");
      fetchToken();
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
      handleErr(err);
    } finally {
      setManualLoading(false);
    }
  };

  const handleErr = (err) => {
    toast.error(err.response?.data?.message || "Failed");
    if (err.response?.data?.cooldownRemaining) {
      setTokenStatus({
        hasToken: false,
        cooldownRemaining: err.response.data.cooldownRemaining,
      });
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m}m ${sc < 10 ? "0" : ""}${sc}s`;
  };

  const logout = () => {
    stopScanning();
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    navigate("/");
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${tokenStatus.hasToken ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}
        >
          {tokenStatus.hasToken
            ? "🟢 Token Ready"
            : `⏳ ${fmt(tokenStatus.cooldownRemaining)}`}
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all"
        >
          Logout
        </button>
      </Navbar>

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
          className={`p-5 bg-gray-900/50 border rounded-2xl mb-6 border-l-4 ${tokenStatus.hasToken ? "border-gray-800 border-l-emerald-500" : "border-gray-800 border-l-amber-500"}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-gray-100">Token Status</h4>
              <p className="text-gray-400 text-xs mt-1">
                {tokenStatus.hasToken
                  ? "Token available. Scan a QR code."
                  : `Cooldown: ${fmt(tokenStatus.cooldownRemaining)}`}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${tokenStatus.hasToken ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
            >
              {tokenStatus.hasToken ? "✅" : "⏳"}
            </div>
          </div>
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
                {fmt(tokenStatus.cooldownRemaining)} left
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
                  Point camera at the QR code from your teacher
                </p>
                <button
                  onClick={startScanning}
                  disabled={!tokenStatus.hasToken}
                  className={`px-8 py-4 text-base font-semibold rounded-2xl transition-all ${tokenStatus.hasToken ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"}`}
                >
                  {tokenStatus.hasToken
                    ? "📱 Start Scanning"
                    : "⏳ Cooldown Active"}
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

        {/* Manual */}
        {!success && !scanning && tokenStatus.hasToken && (
          <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Or enter session code manually
            </h4>
            <form onSubmit={handleManual} className="flex gap-3">
              <input
                type="text"
                placeholder="Paste session code"
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
              📚 History ({history.length})
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`}
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
                <p className="text-center text-gray-400 text-sm py-8">
                  No records yet
                </p>
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
                          {new Date(r.markedAt).toLocaleString()}
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
    </>
  );
}
