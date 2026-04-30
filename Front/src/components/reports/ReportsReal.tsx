"use client";

import type { ReportesData } from "@/src/components/reports/Reports";
import { formatPrice } from "@/src/lib/pos-types";

type ReportsRealProps = {
  data: ReportesData | null;
};

export function ReportsReal({ data }: ReportsRealProps) {
  if (!data) {
    return <div className="app-text-muted-inverse p-4 text-sm">Sin datos.</div>;
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="app-surface-dark app-text-inverse rounded-3xl border px-4 py-5 shadow-md">
          <p className="app-text-muted-inverse text-xs uppercase tracking-wide">Ingresos</p>
          <p className="ps-display mt-1 text-3xl">{formatPrice(data.totalRevenue)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="app-card rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Pedidos</p>
            <p className="text-xl font-semibold text-foreground">{data.totalOrders}</p>
          </div>
          <div className="app-card rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Ticket promedio</p>
            <p className="text-xl font-semibold text-foreground">
              {formatPrice(data.averageTicket)}
            </p>
          </div>
        </div>
        <div className="app-card rounded-2xl p-4 shadow-sm">
          <p className="mb-2 text-xs text-muted-foreground">Top productos</p>
          <div className="space-y-2">
            {data.topProducts.map((p) => (
              <div key={p.id} className="app-card-subtle flex items-center justify-between rounded-xl px-3 py-2 text-sm">
                <span className="text-foreground">{p.name}</span>
                <span className="app-tab-active rounded-full px-2 py-0.5 text-xs font-semibold">{p.totalSold}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
