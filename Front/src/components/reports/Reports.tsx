"use client"

import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { cn } from "@/src/lib/utils"
import { formatPrice } from "@/src/lib/pos-types"
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Award,
  BarChart2,
  Calendar,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "hoy" | "semana" | "mes"

type SaleDataPoint = {
  label: string   // e.g. "Lun", "12/03"
  total: number
  count: number
}

type TopProduct = {
  id: string
  name: string
  image: string
  totalSold: number
  revenue: number
}

export type ReportesData = {
  period: Period
  salesByPeriod: SaleDataPoint[]
  topProducts: TopProduct[]
  totalRevenue: number
  totalOrders: number
  averageTicket: number
  revenueGrowth: number // % vs previous period
}

// ─── Mock data (replace with context/props) ───────────────────────────────────

const MOCK: Record<Period, ReportesData> = {
  hoy: {
    period: "hoy",
    totalRevenue: 87400,
    totalOrders: 34,
    averageTicket: 2570,
    revenueGrowth: 12.4,
    salesByPeriod: [
      { label: "10:00", total: 5200,  count: 2 },
      { label: "11:00", total: 12400, count: 5 },
      { label: "12:00", total: 18700, count: 7 },
      { label: "13:00", total: 22100, count: 8 },
      { label: "14:00", total: 15800, count: 6 },
      { label: "15:00", total: 8400,  count: 4 },
      { label: "16:00", total: 4800,  count: 2 },
    ],
    topProducts: [
      { id: "1", name: "Choripán",      image: "🌭", totalSold: 28, revenue: 39200 },
      { id: "2", name: "Cerveza 1L",    image: "🍺", totalSold: 24, revenue: 33600 },
      { id: "3", name: "Empanada",      image: "🥟", totalSold: 19, revenue: 14250 },
      { id: "4", name: "Gaseosa",       image: "🥤", totalSold: 15, revenue: 9750  },
      { id: "5", name: "Agua mineral",  image: "💧", totalSold: 12, revenue: 4800  },
    ],
  },
  semana: {
    period: "semana",
    totalRevenue: 412000,
    totalOrders: 158,
    averageTicket: 2607,
    revenueGrowth: 8.1,
    salesByPeriod: [
      { label: "Lun", total: 48000,  count: 18 },
      { label: "Mar", total: 55000,  count: 22 },
      { label: "Mié", total: 43000,  count: 16 },
      { label: "Jue", total: 67000,  count: 26 },
      { label: "Vie", total: 91000,  count: 35 },
      { label: "Sáb", total: 108000, count: 41 },
    ],
    topProducts: [
      { id: "1", name: "Choripán",      image: "🌭", totalSold: 134, revenue: 187600 },
      { id: "2", name: "Cerveza 1L",    image: "🍺", totalSold: 112, revenue: 156800 },
      { id: "3", name: "Empanada",      image: "🥟", totalSold: 89,  revenue: 66750  },
      { id: "4", name: "Gaseosa",       image: "🥤", totalSold: 74,  revenue: 48100  },
      { id: "5", name: "Agua mineral",  image: "💧", totalSold: 56,  revenue: 22400  },
    ],
  },
  mes: {
    period: "mes",
    totalRevenue: 1840000,
    totalOrders: 710,
    averageTicket: 2591,
    revenueGrowth: 21.3,
    salesByPeriod: [
      { label: "Sem 1", total: 380000, count: 145 },
      { label: "Sem 2", total: 420000, count: 162 },
      { label: "Sem 3", total: 490000, count: 189 },
      { label: "Sem 4", total: 550000, count: 214 },
    ],
    topProducts: [
      { id: "1", name: "Choripán",      image: "🌭", totalSold: 560, revenue: 784000 },
      { id: "2", name: "Cerveza 1L",    image: "🍺", totalSold: 490, revenue: 686000 },
      { id: "3", name: "Empanada",      image: "🥟", totalSold: 380, revenue: 285000 },
      { id: "4", name: "Gaseosa",       image: "🥤", totalSold: 310, revenue: 201500 },
      { id: "5", name: "Agua mineral",  image: "💧", totalSold: 240, revenue: 96000  },
    ],
  },
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data }: { data: SaleDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => {
        const pct = (d.total / max) * 100
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <motion.div
              className="w-full rounded-t-lg bg-primary/70"
              style={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
            />
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="liquid-glass-card rounded-2xl p-4 flex flex-col gap-2">
      <span className={cn("flex items-center justify-center size-9 rounded-xl", `bg-current/10 ${accent}`)}>
        <Icon className={cn("size-4", accent)} strokeWidth={1.8} />
      </span>
      <div>
        <p className="text-xl font-black tabular-nums text-foreground leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[11px] text-emerald-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Top product row ──────────────────────────────────────────────────────────

function TopProductRow({
  product,
  rank,
  maxRevenue,
}: {
  product: TopProduct
  rank: number
  maxRevenue: number
}) {
  const pct = (product.revenue / maxRevenue) * 100

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="shrink-0 w-5 text-center text-[11px] font-bold text-muted-foreground tabular-nums">
        {rank}
      </span>
      <span className="text-xl leading-none shrink-0">{product.image}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{product.name}</p>
        <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, delay: rank * 0.06, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-bold tabular-nums text-foreground">{formatPrice(product.revenue)}</p>
        <p className="text-[10px] text-muted-foreground">{product.totalSold} uds</p>
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Pass `data` prop to use real data from your context.
 * Falls back to mock data by default.
 */
export function ReportsScreen({
  data: externalData,
}: {
  data?: Partial<Record<Period, ReportesData>>
}) {
  const [period, setPeriod] = useState<Period>("hoy")

  const data = externalData?.[period] ?? MOCK[period]

  const PERIODS: { id: Period; label: string }[] = [
    { id: "hoy",    label: "Hoy"    },
    { id: "semana", label: "Semana" },
    { id: "mes",    label: "Mes"    },
  ]

  const maxRevenue = Math.max(...data.topProducts.map((p) => p.revenue), 1)

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      {/* Period selector */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="size-4 text-muted-foreground" />
          Reportes
        </div>
        <div className="flex gap-1 liquid-glass-card rounded-xl p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors duration-150 active:scale-95",
                period === p.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 scrollbar-none space-y-4">
        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="Ingresos"
            value={formatPrice(data.totalRevenue)}
            sub={`+${data.revenueGrowth}% vs anterior`}
            icon={DollarSign}
            accent="text-emerald-500"
          />
          <StatCard
            label="Pedidos"
            value={String(data.totalOrders)}
            icon={ShoppingBag}
            accent="text-blue-500"
          />
          <StatCard
            label="Ticket promedio"
            value={formatPrice(data.averageTicket)}
            icon={TrendingUp}
            accent="text-primary"
          />
          <StatCard
            label="Productos top"
            value={String(data.topProducts.length)}
            icon={Award}
            accent="text-yellow-500"
          />
        </div>

        {/* Bar chart */}
        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="size-4 text-muted-foreground" />
            <p className="text-[13px] font-semibold text-foreground">Ventas por período</p>
          </div>
          <BarChart data={data.salesByPeriod} />
        </div>

        {/* Top products */}
        <div className="liquid-glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="size-4 text-muted-foreground" />
            <p className="text-[13px] font-semibold text-foreground">Productos más vendidos</p>
          </div>
          <div className="divide-y divide-white/15 dark:divide-white/8">
            {data.topProducts.map((p, i) => (
              <TopProductRow
                key={p.id}
                product={p}
                rank={i + 1}
                maxRevenue={maxRevenue}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}