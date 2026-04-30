"use client";

import { clearSession, readSession, writeSession, type SessionData } from "@/src/lib/auth-session";

export type LoginPayload = {
  user: string;
  password?: string;
  pin?: string;
};

type LoginResponse = SessionData;

type ApiErrorBody = {
  message?: string | string[];
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:4000/api";

let authCache: LoginResponse | null = readSession();

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(body.message)
      ? body.message.join(" · ")
      : body.message || "No se pudo autenticar.";
    throw new Error(message);
  }

  const data = (await response.json()) as LoginResponse;
  authCache = data;
  writeSession(data);
  return data;
}

export function logout() {
  authCache = null;
  clearSession();
}

export function getSessionSync() {
  return authCache;
}

export async function getSession() {
  return authCache;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const session = authCache;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Sesión expirada. Volvé a iniciar sesión.");
    }
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(body.message)
      ? body.message.join(" · ")
      : body.message || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function withPagination<T>(value: unknown): { data: T[]; meta?: unknown } {
  if (Array.isArray(value)) return { data: value };
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    const objectValue = value as Record<string, unknown>;
    return {
      data: (objectValue.data as T[]) ?? [],
      meta: objectValue.meta,
    };
  }
  return { data: [] };
}
