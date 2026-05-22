import { clearToken, getToken } from "./auth";
import { ApiError, extractApiMessage } from "./errors";

export { ApiError } from "./errors";

interface SimpleFetchOptions extends RequestInit {
  parseJson?: boolean;
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  clearToken();
  window.location.assign("/login");
}

export async function apiFetch<T = unknown>(
  url: string,
  options: SimpleFetchOptions = {}
): Promise<T> {
  const { headers, parseJson = true, body, ...rest } = options;
  const requestHeaders = new Headers(headers ?? {});
  const token = getToken();

  if (!(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      body,
      headers: requestHeaders,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError("Erro de rede", 0, err);
  }

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirectToLogin();
    }

    throw new ApiError(
      extractApiMessage(data) ?? `Erro HTTP ${response.status}`,
      response.status,
      data
    );
  }

  return (parseJson ? data : undefined) as T;
}
