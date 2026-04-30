"use client";

export type SessionUser = {
  id: number;
  user: string;
  role: "Admin" | "Cajero";
  id_point: number;
  id_market: number;
};

export type SessionData = {
  access_token: string;
  user: SessionUser;
};

const SESSION_KEY = "pos.session";

export function readSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function writeSession(session: SessionData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
