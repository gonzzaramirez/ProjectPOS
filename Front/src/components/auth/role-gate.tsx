"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionSync, logout } from "@/src/lib/api";
import type { SessionUser } from "@/src/lib/auth-session";

type RoleGateProps = {
  allow: SessionUser["role"][];
  children: React.ReactNode;
};

export function RoleGate({ allow, children }: RoleGateProps) {
  const router = useRouter();
  const session = getSessionSync();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(session.user.role)) {
      router.replace(session.user.role === "Admin" ? "/admin" : "/cajero");
    }
  }, [allow, router, session]);

  if (!session || !allow.includes(session.user.role)) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Verificando sesión...
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="liquid-glass-panel h-14 px-4 md:px-6 flex items-center justify-between text-sm sticky top-0 z-50">
        <span className="font-medium">
          {session.user.user} · {session.user.role}
        </span>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="liquid-glass-pill px-3 py-1.5 text-xs font-medium hover:text-foreground transition"
        >
          Salir
        </button>
      </header>
      {children}
    </div>
  );
}
