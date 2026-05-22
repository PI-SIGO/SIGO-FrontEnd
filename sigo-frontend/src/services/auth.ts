import { buildBackendUrl } from "@/lib/config";
import type { AuthUser, UserRole } from "@/types/entities";
import { unwrapData } from "./service-utils";
import { ApiError, extractApiMessage } from "./errors";

const AUTH_STORAGE_KEY = "sigo.auth.token";
export const AUTH_CHANGE_EVENT = "sigo:auth-changed";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const OFICINA_ID_CLAIM = "oficina_id";

const VALID_ROLES: UserRole[] = ["Admin", "Funcionario", "Oficina", "Cliente"];

interface JwtPayload {
  exp?: number;
  role?: string;
  email?: string;
  name?: string;
  sub?: string;
  [ROLE_CLAIM]?: string;
  [NAME_CLAIM]?: string;
  [NAME_IDENTIFIER_CLAIM]?: string;
  [EMAIL_CLAIM]?: string;
  [OFICINA_ID_CLAIM]?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitAuthChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function tryParseJson(text: string) {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) {
    return null;
  }

  return VALID_ROLES.find((currentRole) => currentRole === role) ?? null;
}

function decodeBase64Url(value: string) {
  if (!isBrowser()) {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return window.atob(padded);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  const decoded = decodeBase64Url(payload);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

async function requestLoginToken(endpoint: string, email: string, senha: string) {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email.trim(),
        Password: senha,
      }),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError("Erro de rede", 0, error);
  }

  const text = await response.text();
  const payload = tryParseJson(text);

  if (!response.ok) {
    throw new ApiError(
      extractApiMessage(payload) ?? `Erro HTTP ${response.status}`,
      response.status,
      payload
    );
  }

  const token = unwrapData<string>(payload);

  if (!token) {
    throw new ApiError("Token de acesso nao retornado pela API.", response.status, payload);
  }

  return token;
}

export async function loginCliente(email: string, senha: string) {
  return requestLoginToken(buildBackendUrl("clientes/login"), email, senha);
}

export async function loginFuncionario(email: string, senha: string) {
  return requestLoginToken(buildBackendUrl("funcionarios/login"), email, senha);
}

export async function loginOficina(email: string, senha: string) {
  return requestLoginToken(buildBackendUrl("oficinas/login"), email, senha);
}

export function setToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  emitAuthChange();
}

export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChange();
}

export function getUserFromToken(token = getToken()): AuthUser | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    clearToken();
    return null;
  }

  const exp = toNumber(payload.exp);
  if (exp && exp * 1000 <= Date.now()) {
    clearToken();
    return null;
  }

  const role = normalizeRole(payload[ROLE_CLAIM] ?? payload.role);
  const id = toNumber(payload[NAME_IDENTIFIER_CLAIM] ?? payload.sub);
  const oficinaId = toNumber(payload[OFICINA_ID_CLAIM]);

  if (!role || !id) {
    return null;
  }

  return {
    id,
    name: payload[NAME_CLAIM] ?? payload.name ?? "",
    email: payload[EMAIL_CLAIM] ?? payload.email ?? "",
    role,
    oficinaId,
    exp,
    token,
  };
}

export function getUserRole(token = getToken()) {
  return getUserFromToken(token)?.role ?? null;
}

export function isInvalidCredentialsError(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return false;
  }

  const message = extractApiMessage(error.response) ?? error.message;
  return /email ou senha incorretos/i.test(message);
}
