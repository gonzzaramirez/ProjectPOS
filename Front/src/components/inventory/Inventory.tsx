"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { cn } from "@/src/lib/utils"
import { PRODUCTS, CATEGORIES, formatPrice, type Product } from "@/src/lib/pos-types"
import { SearchBar } from "../pos/search-bar"
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Edit2,
  Minus,
  Plus,
  Check,
  X,
  ChevronDown,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type StockLevel = "ok" | "low" | "out"

type InventoryItem = Product & {
  stock: number
  minStock: number
}

// ─── Mock stock (replace with your store/context) ─────────────────────────────

const MOCK_STOCK: Record<string, { stock: number; minStock: number }> = {}
PRODUCTS.forEach((p, i) => {
  MOCK_STOCK[p.id] = {
    stock:    [0, 3, 5, 12, 20, 8, 2, 15, 6, 0, 4, 18][i % 12],
    minStock: 4,
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStockLevel(stock: number, min: number): StockLevel {
  if (stock === 0) return "out"
  if (stock <= min) return "low"
  return "ok"
}

const STOCK_CONFIG: Record<
  StockLevel,
  { label: string; icon: React.ElementType; pill: string; text: string }
> = {
  ok:  { label: "Disponible", icon: Package,       pill: "bg-emerald-400/12 text-emerald-500 ring-emerald-400/20", text: "text-emerald-500" },
  low: { label: "Poco stock", icon: AlertTriangle,  pill: "bg-yellow-400/12  text-yellow-500  ring-yellow-400/20",  text: "text-yellow-500"  },
  out: { label: "Agotado",    icon: XCircle,        pill: "bg-destructive/12 text-destructive ring-destructive/20", text: "text-destructive"  },
}

// ─── Stock Editor Panel ───────────────────────────────────────────────────────
// Opens inline below the row. Has ±1 buttons + manual input + confirm/cancel.

function StockEditorPanel({
  item,
  onConfirm,
  onCancel,
}: {
  item: InventoryItem
  onConfirm: (newStock: number) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(item.stock)
  const [inputVal, setInputVal] = useState(String(item.stock))
  const [showConfirm, setShowConfirm] = useState(false)

  const diff = draft - item.stock
  const diffLabel =
    diff === 0 ? null : diff > 0 ? `+${diff}` : `${diff}`

  const handleInput = (val: string) => {
    const clean = val.replace(/\D/g, "")
    setInputVal(clean)
    const n = parseInt(clean, 10)
    if (!isNaN(n) && n >= 0) setDraft(n)
  }

  const handleStep = (delta: number) => {
    const next = Math.max(0, draft + delta)
    setDraft(next)
    setInputVal(String(next))
  }

  const requestConfirm = () => {
    if (draft === item.stock) { onCancel(); return }
    setShowConfirm(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="overflow-hidden"
    >
      <div className="mx-4 mb-3 rounded-2xl border border-white/20 dark:border-white/10 bg-muted/30 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>

          {/* ── Edit view ── */}
          {!showConfirm && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="p-4 space-y-4"
            >
              {/* Label */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Editar stock · {item.name}
                </p>
                <button
                  onClick={onCancel}
                  className="flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* ±1 stepper + input */}
              <div className="flex items-center gap-3">
                {/* Minus */}
                <button
                  onClick={() => handleStep(-1)}
                  disabled={draft === 0}
                  className={cn(
                    "flex items-center justify-center size-11 rounded-xl ring-1 font-bold transition-all active:scale-90",
                    draft === 0
                      ? "bg-muted/40 text-muted-foreground/40 ring-border/40 cursor-not-allowed"
                      : "bg-destructive/10 text-destructive ring-destructive/20 hover:bg-destructive/20"
                  )}
                  aria-label="Restar uno"
                >
                  <Minus className="size-4" strokeWidth={2.5} />
                </button>

                {/* Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputVal}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") requestConfirm() }}
                    className={cn(
                      "w-full h-11 rounded-xl text-center text-2xl font-black tabular-nums",
                      "bg-background/60 border border-border text-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      "transition-all"
                    )}
                    aria-label="Cantidad de stock"
                  />
                  {/* Diff badge */}
                  <AnimatePresence>
                    {diffLabel && (
                      <motion.span
                        key={diffLabel}
                        initial={{ opacity: 0, scale: 0.7, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className={cn(
                          "absolute -top-2.5 right-2 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                          diff > 0
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-destructive/15 text-destructive"
                        )}
                      >
                        {diffLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Plus */}
                <button
                  onClick={() => handleStep(1)}
                  className="flex items-center justify-center size-11 rounded-xl ring-1 bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 hover:bg-emerald-500/20 font-bold transition-all active:scale-90"
                  aria-label="Sumar uno"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Ajuste rápido</p>
                <div className="flex gap-1.5">
                  {[-10, -5, +5, +10, +20].map((delta) => (
                    <button
                      key={delta}
                      onClick={() => handleStep(delta)}
                      disabled={delta < 0 && draft + delta < 0}
                      className={cn(
                        "flex-1 h-8 rounded-xl text-[11px] font-semibold ring-1 transition-all active:scale-95",
                        delta < 0
                          ? "bg-destructive/8 text-destructive ring-destructive/15 hover:bg-destructive/15 disabled:opacity-30 disabled:cursor-not-allowed"
                          : "bg-primary/8 text-primary ring-primary/15 hover:bg-primary/15"
                      )}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onCancel}
                  className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  onClick={requestConfirm}
                  disabled={draft === item.stock}
                  className={cn(
                    "flex-1 h-9 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98]",
                    draft !== item.stock
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Guardar cambios
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Confirm view ── */}
          {showConfirm && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
              className="p-4 space-y-4"
            >
              <div className="text-center space-y-1">
                <p className="text-[13px] font-semibold text-foreground">¿Confirmar cambio?</p>
                <p className="text-xs text-muted-foreground">
                  Stock de{" "}
                  <span className="font-bold text-foreground">{item.name}</span>
                </p>
              </div>

              {/* Before → After */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Antes</p>
                  <p className="text-3xl font-black tabular-nums text-muted-foreground">{item.stock}</p>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ChevronDown className="size-4 text-muted-foreground rotate-[-90deg]" />
                  <span
                    className={cn(
                      "text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full",
                      diff > 0
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-destructive/15 text-destructive"
                    )}
                  >
                    {diffLabel}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Después</p>
                  <p className="text-3xl font-black tabular-nums text-foreground">{draft}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <X className="size-3.5" />
                  Volver
                </button>
                <button
                  onClick={() => onConfirm(draft)}
                  className="flex-1 h-9 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: number | string; sub?: string
  icon: React.ElementType; accent: string
}) {
  return (
    <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-2xl font-black tabular-nums leading-tight mt-0.5", accent)}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <span className={cn("flex items-center justify-center size-10 rounded-2xl bg-current/10 shrink-0", accent)}>
        <Icon className={cn("size-5", accent)} strokeWidth={1.8} />
      </span>
    </div>
  )
}

// ─── Alert row ────────────────────────────────────────────────────────────────

function AlertRow({ item, accent }: { item: InventoryItem; accent: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/30 border border-white/20 dark:border-white/8">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative size-8 rounded-lg overflow-hidden shrink-0 border border-white/30 dark:border-white/10">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" unoptimized />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">{item.name}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{item.category}</p>
        </div>
      </div>
      <span className={cn("shrink-0 text-[11px] font-bold tabular-nums", accent)}>
        {item.stock === 0 ? "Sin stock" : `${item.stock} restantes`}
      </span>
    </div>
  )
}

// ─── Product table row ────────────────────────────────────────────────────────

function ProductRow({
  item,
  isEditing,
  onToggleEdit,
  onSave,
  onCancel,
}: {
  item: InventoryItem
  isEditing: boolean
  onToggleEdit: (id: string) => void
  onSave: (id: string, stock: number) => void
  onCancel: () => void
}) {
  const level = getStockLevel(item.stock, item.minStock)
  const cfg   = STOCK_CONFIG[level]
  const Icn   = cfg.icon

  return (
    <>
      <motion.tr
        layout="position"
        className="border-b border-white/12 dark:border-white/8"
        style={{ borderBottomWidth: isEditing ? 0 : undefined }}
      >
        {/* Thumbnail */}
        <td className="py-3 pl-4 pr-2 w-10">
          <div className="relative size-9 rounded-xl overflow-hidden border border-white/30 dark:border-white/10 bg-muted/30 shrink-0">
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" unoptimized />
          </div>
        </td>

        {/* Name + category */}
        <td className="py-3 px-2">
          <p className="text-[13px] font-semibold text-foreground truncate max-w-[110px] sm:max-w-none">{item.name}</p>
          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{item.category}</p>
        </td>

        {/* Price */}
        <td className="py-3 px-2 text-right">
          <span className="text-[13px] font-semibold tabular-nums text-foreground">{formatPrice(item.price)}</span>
        </td>

        {/* Stock number */}
        <td className="py-3 px-2 text-right">
          <span className={cn("text-[14px] font-black tabular-nums", cfg.text)}>{item.stock}</span>
        </td>

        {/* Value */}
        <td className="py-3 px-2 text-right hidden sm:table-cell">
          <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
            {formatPrice(item.price * item.stock)}
          </span>
        </td>

        {/* Status + edit button */}
        <td className="py-3 pl-2 pr-4">
          <div className="flex flex-col items-start gap-1.5">
            <span className={cn(
              "flex items-center gap-1 w-fit px-2 py-1 rounded-full text-[10px] font-semibold ring-1 whitespace-nowrap",
              cfg.pill
            )}>
              <Icn className="size-2.5" strokeWidth={2.5} />
              {cfg.label}
            </span>
            <button
              onClick={() => onToggleEdit(item.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all active:scale-95",
                isEditing
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              aria-label={isEditing ? "Cerrar editor" : "Editar stock"}
            >
              <Edit2 className="size-2.5" />
              {isEditing ? "Editando..." : "Editar stock"}
            </button>
          </div>
        </td>
      </motion.tr>

      {/* Expandable editor row — spans all columns */}
      <tr className={isEditing ? "border-b border-white/12 dark:border-white/8" : ""}>
        <td colSpan={6} className="p-0">
          <AnimatePresence initial={false}>
            {isEditing && (
              <StockEditorPanel
                key={item.id}
                item={item}
                onConfirm={(n) => onSave(item.id, n)}
                onCancel={onCancel}
              />
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function InventoryScreen() {
  const [search, setSearch]            = useState("")
  const [activeCategory, setCategory]  = useState("todos")
  const [editingId, setEditingId]      = useState<string | null>(null)
  const [stockOverrides, setOverrides] = useState<Record<string, number>>({})

  const items: InventoryItem[] = useMemo(() =>
    PRODUCTS.map((p) => ({
      ...p,
      stock:    stockOverrides[p.id] ?? MOCK_STOCK[p.id]?.stock ?? 0,
      minStock: MOCK_STOCK[p.id]?.minStock ?? 4,
    })), [stockOverrides])

  const lowStock   = items.filter((i) => getStockLevel(i.stock, i.minStock) === "low")
  const outStock   = items.filter((i) => getStockLevel(i.stock, i.minStock) === "out")
  const totalUnits = items.reduce((s, i) => s + i.stock, 0)
  const totalValue = items.reduce((s, i) => s + i.price * i.stock, 0)

  const filtered = useMemo(() => {
    let list = items
    if (activeCategory !== "todos") list = list.filter((i) => i.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, activeCategory, search])

  const handleSave = (id: string, stock: number) => {
    setOverrides((prev) => ({ ...prev, [id]: stock }))
    setEditingId(null)
  }

  const handleToggleEdit = (id: string) => {
    setEditingId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden pb-16">
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-none">
        <div className="px-4 py-4 space-y-4">

          {/* ── 1. Stat cards ──────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Total productos" value={items.length}      icon={Package}       accent="text-primary"      />
            <StatCard label="Stock total"      value={totalUnits}        sub="unidades"        icon={TrendingUp}          accent="text-emerald-500" />
            <StatCard label="Poco stock"       value={lowStock.length}   sub="necesita reabastecimiento" icon={AlertTriangle} accent="text-yellow-500"  />
            <StatCard label="Sin stock"        value={outStock.length}   sub="urgente"         icon={XCircle}             accent="text-destructive" />
          </div>

          {/* ── 2. Alert panels ────────────────────────── */}
          <AnimatePresence>
            {(lowStock.length > 0 || outStock.length > 0) && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                {lowStock.length > 0 && (
                  <div className="liquid-glass-card rounded-2xl p-4 space-y-2.5 border-l-2 border-yellow-500/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-yellow-500" strokeWidth={2} />
                      <p className="text-[13px] font-semibold text-foreground">Advertencia de poco stock</p>
                    </div>
                    <div className="space-y-1.5">
                      {lowStock.map((i) => <AlertRow key={i.id} item={i} accent="text-yellow-500" />)}
                    </div>
                  </div>
                )}
                {outStock.length > 0 && (
                  <div className="liquid-glass-card rounded-2xl p-4 space-y-2.5 border-l-2 border-destructive/50">
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4 text-destructive" strokeWidth={2} />
                      <p className="text-[13px] font-semibold text-foreground">Sin stock</p>
                    </div>
                    <div className="space-y-1.5">
                      {outStock.map((i) => <AlertRow key={i.id} item={i} accent="text-destructive" />)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 3. Full product table ───────────────────── */}
          <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/20 dark:border-white/8 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-semibold text-foreground">Todos los productos</p>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Valor total inventario</p>
                  <p className="text-sm font-black tabular-nums text-foreground">{formatPrice(totalValue)}</p>
                </div>
              </div>
              <SearchBar value={search} onChange={setSearch} />
              <div className="flex gap-1 overflow-x-auto scrollbar-none" role="tablist">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                        "transition-colors duration-150 active:scale-[0.98]",
                        isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="flex items-center justify-center size-12 rounded-2xl bg-muted/40">
                  <Package className="size-6 text-muted-foreground" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-semibold text-foreground">Sin resultados</p>
                <p className="text-xs text-muted-foreground">Probá con otra búsqueda o categoría</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/15 dark:border-white/8">
                      <th className="py-2.5 pl-4 pr-2 w-10" />
                      <th className="py-2.5 px-2 text-left   text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                      <th className="py-2.5 px-2 text-right  text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Precio</th>
                      <th className="py-2.5 px-2 text-right  text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                      <th className="py-2.5 px-2 text-right  text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Valor</th>
                      <th className="py-2.5 pl-2 pr-4 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <ProductRow
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        onToggleEdit={handleToggleEdit}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}