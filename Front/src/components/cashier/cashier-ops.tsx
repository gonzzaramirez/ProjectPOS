"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/src/lib/api";
import { posSdk } from "@/src/lib/api/pos-sdk";

type Shift = {
  id_shift: number;
  status: string;
  opening_amount: number;
  opened_at: string;
};

type Withdrawal = {
  id_withdrawal: number;
  amount: number;
  reason: string;
  created_at: string;
};

export function CashierOps() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [openingAmount, setOpeningAmount] = useState("10000");
  const [closingAmount, setClosingAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const session = await getSession();
    if (!session) return;
    try {
      const [active, list] = await Promise.all([
        posSdk.shifts.active(session.user.id_market, session.user.id_point),
        posSdk.withdrawals.list(session.user.id_market, session.user.id_point),
      ]);
      setActiveShift((active as Shift) ?? null);
      setWithdrawals(Array.isArray(list) ? (list as Withdrawal[]) : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar caja.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openShift = async () => {
    const session = await getSession();
    if (!session) return;
    await posSdk.shifts.open({
      id_user: session.user.id,
      id_point: session.user.id_point,
      id_market: session.user.id_market,
      opening_amount: Number(openingAmount),
    });
    setMessage("Turno abierto.");
    await load();
  };

  const closeShift = async () => {
    if (!activeShift) return;
    await posSdk.shifts.close(String(activeShift.id_shift), {
      closing_amount: Number(closingAmount),
    });
    setMessage("Turno cerrado.");
    await load();
  };

  const createWithdrawal = async () => {
    const session = await getSession();
    if (!session || !activeShift) return;
    await posSdk.withdrawals.create({
      amount: Number(withdrawAmount),
      reason: withdrawReason,
      id_user: session.user.id,
      id_point: session.user.id_point,
      id_market: session.user.id_market,
      id_shift: activeShift.id_shift,
    });
    setWithdrawAmount("");
    setWithdrawReason("");
    setMessage("Retiro registrado.");
    await load();
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <section className="border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Turno activo</h3>
          {activeShift ? (
            <p className="text-sm">
              #{activeShift.id_shift} · {activeShift.status} · Apertura ${activeShift.opening_amount}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No hay turno activo.</p>
          )}
        </section>

        {!activeShift ? (
          <section className="border rounded-xl p-4 space-y-2">
            <h3 className="font-semibold">Abrir turno</h3>
            <input
              className="border rounded-md px-3 py-2 w-full"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
            />
            <button className="border rounded-md px-3 py-2" onClick={() => void openShift()}>
              Abrir turno
            </button>
          </section>
        ) : (
          <>
            <section className="border rounded-xl p-4 space-y-2">
              <h3 className="font-semibold">Registrar retiro</h3>
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Monto"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Motivo"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
              />
              <button className="border rounded-md px-3 py-2" onClick={() => void createWithdrawal()}>
                Guardar retiro
              </button>
            </section>

            <section className="border rounded-xl p-4 space-y-2">
              <h3 className="font-semibold">Cerrar turno</h3>
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Monto de cierre"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
              <button className="border rounded-md px-3 py-2" onClick={() => void closeShift()}>
                Cerrar turno
              </button>
            </section>
          </>
        )}

        <section className="border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Retiros</h3>
          <div className="space-y-1">
            {withdrawals.map((w) => (
              <p key={w.id_withdrawal} className="text-sm">
                #{w.id_withdrawal} · ${w.amount} · {w.reason}
              </p>
            ))}
          </div>
        </section>

        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
