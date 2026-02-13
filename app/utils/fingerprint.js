import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint = null;

export async function getFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch (error) {
    console.error("Fingerprint error:", error);
    const fallback =
      navigator.userAgent +
      screen.width +
      screen.height +
      new Date().getTimezoneOffset();
    cachedFingerprint = btoa(fallback).substring(0, 32);
    return cachedFingerprint;
  }
}

export async function getStudentHeaders() {
  const fp = await getFingerprint();
  const token = localStorage.getItem("studentToken")?.trim();

  if (!token || token === "undefined" || token === "null") {
    throw new Error("Missing student token");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Device-Fingerprint": fp,
    },
  };
}

export async function getRegisterHeaders() {
  const fp = await getFingerprint();
  return {
    headers: {
      "Content-Type": "application/json",
      "X-Device-Fingerprint": fp,
    },
  };
}
