export const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "https://localhost:7241/api";

export function buildBackendUrl(path: string) {
  const cleanedPath = path.replace(/^\/+/, "");
  let baseUrl = BACKEND_API_BASE_URL.replace(/\/$/, "");
  let needsApiPrefix = !cleanedPath.toLowerCase().startsWith("api/");

  try {
    const parsed = new URL(baseUrl);
    const baseSegments = parsed.pathname.split("/").filter(Boolean);
    if (baseSegments.includes("api")) {
      needsApiPrefix = false;
    }
    baseUrl = `${parsed.origin}${parsed.pathname.replace(/\/$/, "")}`;
  } catch {
    if (baseUrl.toLowerCase().includes("/api")) {
      needsApiPrefix = false;
    }
  }

  const prefix = needsApiPrefix ? "api/" : "";
  const finalPath = `${prefix}${cleanedPath}`;

  return `${baseUrl}/${finalPath}`.replace(/([^:])\/{2,}/g, "$1/");
}
