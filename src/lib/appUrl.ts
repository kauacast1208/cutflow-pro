const DEFAULT_PRODUCTION_APP_URL = "https://cutflow-pro-five.vercel.app";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl() {
  const configured = import.meta.env.VITE_APP_URL;
  if (configured && configured.trim()) {
    return normalizeBaseUrl(configured.trim());
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return DEFAULT_PRODUCTION_APP_URL;
}

export function getAuthCallbackUrl() {
  return `${getAppBaseUrl()}/auth/callback`;
}
