"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/src/lib/utils"
import { formatPrice } from "@/src/lib/pos-types"
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  User,
  Wallet,
  CreditCard,
  Landmark,
  QrCode,
  DollarSign,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered"
export type PaymentMethod = "cash" | "card" | "transfer" | "qr"

export type OrderItem = {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  orderNumber: number
  customerName: string
  timestamp: string | Date
  status: OrderStatus
  paymentMethod: PaymentMethod
  items: OrderItem[]
  total: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string
    icon: React.ElementType
    pill: string       // tailwind classes for the badge
    colHeader: string  // color for column title icon
  }
> = {
  pending:   { label: "Pendiente",  icon: Clock,        pill: "app-card-subtle text-primary ring-primary/20",  colHeader: "text-primary"  },
  preparing: { label: "Preparando", icon: Package,      pill: "bg-primary/10 text-primary ring-primary/20",    colHeader: "text-primary"    },
  ready:     { label: "Listo",      icon: CheckCircle,  pill: "bg-accent/10 text-accent-foreground ring-accent/30", colHeader: "text-accent-foreground" },
  delivered: { label: "Entregado",  icon: Truck,        pill: "app-card-subtle text-muted-foreground ring-border",    colHeader: "text-muted-foreground" },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "delivered",
}

const NEXT_BUTTON_CLASS: Partial<Record<OrderStatus, string>> = {
  pending:   "bg-primary/10 text-primary ring-primary/30 hover:bg-accent/20",
  preparing: "bg-accent/10 text-accent-foreground ring-accent/30 hover:bg-accent/20",
  ready:     "app-card-subtle text-muted-foreground ring-border hover:bg-muted",
}

const PAYMENT_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType }
> = {
  cash:     { label: "Efectivo",      icon: Wallet   },
  card:     { label: "Tarjeta",       icon: CreditCard },
  transfer: { label: "Transferencia", icon: Landmark  },
  qr:       { label: "Código QR",     icon: QrCode    },
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
}) {
  const status   = STATUS_CONFIG[order.status]
  const StatusIcon = status.icon
  const payment  = PAYMENT_CONFIG[order.paymentMethod] ?? { label: order.paymentMethod, icon: DollarSign }
  const PayIcon  = payment.icon
  const next     = NEXT_STATUS[order.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <article className="app-card overflow-hidden rounded-2xl shadow-md">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Order number badge */}
            <span className="shrink-0 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-base tabular-nums">
              #{order.orderNumber}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <p className="truncate text-sm font-semibold text-foreground">{order.customerName}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(order.timestamp).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Status pill */}
          <span
            className={cn(
              "shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1",
              status.pill
            )}
          >
            <StatusIcon className="size-3" strokeWidth={2.5} />
            {status.label}
          </span>
        </div>

        {/* Items list */}
        <div className="app-card-subtle mx-4 mb-3 divide-y divide-border rounded-xl">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg leading-none">{item.image}</span>
                <span className="truncate text-[13px] font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[11px] text-muted-foreground">×{item.quantity}</span>
                <span className="text-[13px] font-semibold text-foreground tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 pb-4 pt-2">
          <div className="flex items-center gap-3">
            {/* Payment */}
            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <PayIcon className="size-3.5" />
              {payment.label}
            </span>
            {/* Total */}
            <span className="text-lg font-black tabular-nums text-foreground">
              {formatPrice(order.total)}
            </span>
          </div>

          {/* Next status button */}
          {next && (
            <button
              onClick={() => onStatusChange(order.id, next)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[12px] font-semibold ring-1 transition-colors active:scale-95",
                NEXT_BUTTON_CLASS[order.status]
              )}
            >
              → {STATUS_CONFIG[next].label}
            </button>
          )}
        </div>
      </article>
    </motion.div>
  )
}

// ─── Summary pill ────────────────────────────────────────────────────────────

function SummaryPill({
  label,
  count,
  colorClass,
}: {
  label: string
  count: number
  colorClass: string
}) {
  return (
    <div className="app-card min-w-[64px] rounded-xl px-3 py-2 text-center shadow-sm">
      <p className={cn("text-xl font-black tabular-nums", colorClass)}>{count}</p>
      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const FILTER_TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all",       label: "Todos"     },
  { id: "pending",   label: "Pendiente" },
  { id: "preparing", label: "Preparando"},
  { id: "ready",     label: "Listos"    },
  { id: "delivered", label: "Entregado" },
]

// ─── Main Screen ─────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for the placeholder PedidosScreen.
 *
 * Props:
 *   orders            – array of Order objects (from your OrdersContext or local state)
 *   onStatusChange    – callback (orderId, newStatus) => void
 */
export function OrderScreen({
  orders = [],
  onStatusChange,
}: {
  orders?: Order[]
  onStatusChange?: (orderId: string, status: OrderStatus) => void
}) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all")

  const byStatus = (s: OrderStatus) => orders.filter((o) => o.status === s)

  const pending   = byStatus("pending")
  const preparing = byStatus("preparing")
  const ready     = byStatus("ready")
  const delivered = byStatus("delivered")

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter)

  const handleChange = (id: string, status: OrderStatus) => {
    onStatusChange?.(id, status)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      {/* Summary row */}
      <div className="app-surface-dark flex items-center gap-2 border-b px-4 py-3">
        <SummaryPill label="Pendiente"  count={pending.length}   colorClass="text-primary"  />
        <SummaryPill label="Preparando" count={preparing.length} colorClass="text-primary"    />
        <SummaryPill label="Listos"     count={ready.length}     colorClass="text-accent-foreground" />
        <SummaryPill label="Entregado"  count={delivered.length} colorClass="text-muted-foreground" />
      </div>

      {/* Filter tabs */}
      <div
        className="app-surface-dark scrollbar-none flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2.5"
        role="tablist"
      >
        {FILTER_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={filter === t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 active:scale-[0.98]",
              filter === t.id
                ? "app-tab-active"
                : "app-text-muted-inverse hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 scrollbar-none">
        {orders.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-3 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="liquid-glass-card flex items-center justify-center size-14 rounded-2xl">
              <Package className="size-7 text-muted-foreground" strokeWidth={1.5} />
            </span>
            <p className="text-sm font-semibold text-foreground">Sin pedidos</p>
            <p className="text-xs text-muted-foreground">
              Los pedidos aparecerán acá cuando se realicen ventas
            </p>
          </motion.div>
        ) : visible.length === 0 ? (
          <motion.p
            className="text-center text-sm text-muted-foreground py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No hay pedidos en este estado
          </motion.p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {visible.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleChange}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}