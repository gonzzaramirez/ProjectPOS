"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

export function PosHeader() {
  const [time, setTime] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="flex items-center justify-between w-full">
      <span className="app-text-inverse text-sm font-medium tracking-tight">
        PosMC
      </span>
      <div className="flex items-center gap-2.5">
        <span
          className="app-text-muted-inverse text-xs tabular-nums"
          aria-hidden="true"
        >
          {time}
        </span>
        <span
          className="flex items-center gap-1"
          role="status"
          aria-label={isOnline ? "Conectado" : "Sin conexión"}
        >
          {isOnline ? (
            <Wifi className="size-3.5 text-accent" strokeWidth={2} />
          ) : (
            <WifiOff
              className="app-text-muted-inverse size-3.5"
              strokeWidth={2}
            />
          )}
        </span>
      </div>
    </header>
  );
}
