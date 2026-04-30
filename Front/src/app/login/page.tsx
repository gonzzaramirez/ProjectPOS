"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await login({
        user,
        ...(password ? { password } : {}),
        ...(pin ? { pin } : {}),
      });
      router.replace(session.user.role === "Admin" ? "/admin" : "/cajero");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-5">
      <section className="app-surface-dark app-text-inverse w-full space-y-5 rounded-[24px] border px-5 py-7 shadow-xl">
        <div className="space-y-1">
          <p className="app-text-muted-inverse text-xs tracking-[0.25px]">Terminal POS</p>
          <h1 className="ps-display text-[32px] leading-[1.2]">Ingresar al sistema</h1>
          <p className="app-text-muted-inverse text-sm">Acceso seguro para Admin y Cajero</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5">
          <input
            className="ps-input w-full px-3.5 py-3"
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
          <input
            className="ps-input w-full px-3.5 py-3"
            placeholder="Contraseña (Admin)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="ps-input w-full px-3.5 py-3"
            placeholder="PIN (Cajero)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {error ? <p className="text-destructive text-xs">{error}</p> : null}
          <button
            className="ps-pill-btn w-full text-base font-semibold disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
