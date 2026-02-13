import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint = null;
const INSTALLATION_KEY = "device_installation_id";

function getInstallationId() {
  let id = localStorage.getItem(INSTALLATION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(INSTALLATION_KEY, id);
  }
  return id;
}

function simpleHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

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
      new Date().getTimezoneOffset() +
      getInstallationId();
    cachedFingerprint = `fallback_${simpleHash(fallback)}`;
    return cachedFingerprint;
  }
}

export async function getStudentHeaders() {
  const fp = await getFingerprint();
  const token = localStorage.getItem("studentToken");
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
