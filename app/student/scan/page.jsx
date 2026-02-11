"use client";
// Marks this as a Client Component (required for hooks, localStorage, camera, etc.)

import { useState, useEffect, useRef, useCallback } from "react";
// React hooks for state, lifecycle, refs, memoized functions

import { useRouter } from "next/navigation";
// Next.js navigation hook

import Link from "next/link";
// Client-side navigation

import axios from "axios";
// HTTP client

import toast from "react-hot-toast";
// Notification system

// Backend API base URL
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StudentScan() {
  const router = useRouter();

  // Logged-in student data
  const [student, setStudent] = useState(null);

  // Token state (cooldown + availability)
  const [tokenStatus, setTokenStatus] = useState({
    hasToken: true,
    cooldownRemaining: 0,
  });

  // Scanner state
  const [scanning, setScanning] = useState(false);

  // Success data after attendance marked
  const [success, setSuccess] = useState(null);

  // Attendance history
  const [history, setHistory] = useState([]);

  // Initial loading state
  const [loading, setLoading] = useState(true);

  // Toggle history accordion
  const [showHistory, setShowHistory] = useState(false);

  // Manual entry state
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Refs for QR scanner instance + DOM
  const scannerRef = useRef(null);
  const qrRef = useRef(null);

  // Memoized function that returns Authorization header
  const auth = useCallback(() => {
    const t = localStorage.getItem("studentToken");
    return { headers: { Authorization: `Bearer ${t}` } };
  }, []);

  // Initial auth + data fetch
  useEffect(() => {
    const t = localStorage.getItem("studentToken");
    const d = localStorage.getItem("studentData");

    // Redirect if not authenticated
    if (!t || !d) {
      router.push("/student/register");
      return;
    }

    setStudent(JSON.parse(d));

    fetchToken();
    fetchHistory();

    setLoading(false);
  }, [router]);

  // Cooldown countdown effect
  useEffect(() => {
    if (tokenStatus.cooldownRemaining > 0) {
      // Decrement cooldown every second
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

  // Fetch token availability from backend
  const fetchToken = async () => {
    try {
      const res = await axios.get(`${API}/student/token-status`, auth());
      setTokenStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch attendance history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/attendance/my-attendance`, auth());
      setHistory(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Start camera scanning
  const startScanning = async () => {
    // Block if cooldown active
    if (!tokenStatus.hasToken) {
      toast.error("No token. Wait for cooldown.");
      return;
    }

    setScanning(true);
    setSuccess(null);

    try {
      // Dynamically import QR scanner library
      const { Html5Qrcode } = await import("html5-qrcode");

      // Small delay to ensure DOM is mounted
      await new Promise((r) => setTimeout(r, 200));

      if (scannerRef.current) {
        const qr = new Html5Qrcode("qr-reader");
        qrRef.current = qr;

        await qr.start(
          { facingMode: "environment" }, // Use back camera
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (text) => {
            // On successful scan
            await handleScan(text);
            stopScanning();
          },
          () => {},
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Camera error. Check permissions.");
      setScanning(false);
    }
  };

  // Stop camera scanning
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

  // Handle scanned QR data
  const handleScan = async (qrData) => {
    try {
      let parsed;

      // Attempt to parse QR JSON
      try {
        parsed = JSON.parse(qrData);
      } catch {
        toast.error("Invalid QR");
        return;
      }

      // Ensure sessionCode exists
      if (!parsed.sessionCode) {
        toast.error("Invalid QR format");
        return;
      }

      await markAttendance(parsed.sessionCode);
    } catch (err) {
      handleErr(err);
    }
  };

  // Call backend to mark attendance
  const markAttendance = async (code) => {
    const res = await axios.post(
      `${API}/attendance/mark`,
      { sessionCode: code },
      auth(),
    );

    if (res.data.success) {
      setSuccess(res.data.attendance);
      toast.success("Attendance marked! ✅");

      // Refresh token + history
      fetchToken();
      fetchHistory();
    }
  };

  // Manual session code submission
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

  // Centralized error handler
  const handleErr = (err) => {
    toast.error(err.response?.data?.message || "Failed");

    // If backend returns cooldown info, update UI
    if (err.response?.data?.cooldownRemaining) {
      setTokenStatus({
        hasToken: false,
        cooldownRemaining: err.response.data.cooldownRemaining,
      });
    }
  };

  // Format seconds into "Xm Ys"
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m}m ${sc < 10 ? "0" : ""}${sc}s`;
  };

  // Logout logic
  const logout = () => {
    stopScanning();
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    router.push("/");
  };
}
