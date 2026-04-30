"use client"

import { useState, useMemo } from "react"
import { sileo } from "sileo"
import { cn } from "@/src/lib/utils"
import type { CartItem } from "@/src/lib/pos-types"
import { formatPrice, QUICK_AMOUNTS } from "@/src/lib/pos-types"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/src/components/ui/drawer"
import { CartItemRow } from "./cart-item-row"
import {
  ShoppingCart,
  Banknote,
  Smartphone,
  Check,
  Trash2,
  X,
  CreditCard,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "efectivo" | "transferencia" | "debito" | "credito"

type CartDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  total: number
  count: number
  onUpdate: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onConfirmSale: (params: {
    paymentMethod: PaymentMethod
    amountPaid: number
  }) => Promise<void> | void
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo:      "Efectivo",
  transferencia: "Transferencia",
  debito:        "Débito",
  credito:       "Crédito",
}

// ─── Confirm button ───────────────────────────────────────────────────────────

function ConfirmButton({
  canConfirm,
  paymentMethod,
  onClick,
}: {
  canConfirm: boolean
  paymentMethod: PaymentMethod | null
  onClick: () => void
}) {
  const label = paymentMethod ? PAYMENT_LABELS[paymentMethod] : null

  return (
    <button
      onClick={onClick}
      disabled={!canConfirm}
      className={cn(
        "flex items-center justify-center gap-2.5 w-full h-14 rounded-2xl mt-4",
        "text-[15px] font-semibold transition-all duration-300 active:scale-[0.98]",
        canConfirm
          ? "bg-success text-success-foreground shadow-lg shadow-success/25"
          : "bg-foreground/8 text-muted-foreground cursor-not-allowed"
      )}
      aria-label="Confirmar venta"
    >
      <Check className="size-5" strokeWidth={2.5} />
      <span>
        {canConfirm && label
          ? `Confirmar · ${label}`
          : "Confirmar Venta"}
      </span>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CartDrawer({
  open,
  onOpenChange,
  items,
  total,
  count,
  onUpdate,
  onRemove,
  onClear,
  onConfirmSale,
}: CartDrawerProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [showCardPicker, setShowCardPicker]       = useState(false)
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [amountPaid, setAmountPaid]   = useState<number>(0)
  const [customAmount, setCustomAmount] = useState("")

  const change = useMemo(() => {
    if (paymentMethod !== "efectivo") return 0
    return Math.max(0, amountPaid - total)
  }, [amountPaid, total, paymentMethod])

  const canConfirm = useMemo(() => {
    if (items.length === 0 || !paymentMethod) return false
    if (paymentMethod === "efectivo")      return amountPaid >= total
    if (paymentMethod === "transferencia") return transferConfirmed
    if (paymentMethod === "debito")        return true
    if (paymentMethod === "credito")       return true
    return false
  }, [paymentMethod, amountPaid, total, items.length, transferConfirmed])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetFlow = () => {
    setPaymentMethod(null)
    setShowCardPicker(false)
    setTransferConfirmed(false)
    setAmountPaid(0)
    setCustomAmount("")
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetFlow()
    onOpenChange(val)
  }

  // ── Confirm sale ───────────────────────────────────────────────────────────

  const handleConfirmSale = async () => {
    const saleChange = change
    const saleTotal  = total
    const saleMethod = paymentMethod
    const label      = saleMethod ? PAYMENT_LABELS[saleMethod] : ""

    try {
      await onConfirmSale({
        paymentMethod: saleMethod ?? "efectivo",
        amountPaid,
      })
      onClear()
      resetFlow()
      onOpenChange(false)

      sileo.success({
        title: "Venta confirmada",
        description:
          saleMethod === "efectivo" && saleChange > 0
            ? `${label} · Total: ${formatPrice(saleTotal)} | Vuelto: ${formatPrice(saleChange)}`
            : `${label} · Total: ${formatPrice(saleTotal)}`,
      })
    } catch (error) {
      sileo.error({
        title: "Error al guardar venta",
        description:
          error instanceof Error ? error.message : "No se pudo registrar la venta",
      })
    }
  }

  // ── Efectivo helpers ───────────────────────────────────────────────────────

  const handleQuickAmount = (amount: number) => { setAmountPaid(amount); setCustomAmount("") }
  const handleExactAmount = ()                  => { setAmountPaid(total); setCustomAmount("") }
  const handleCustomAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "")
    setCustomAmount(cleaned)
    setAmountPaid(cleaned ? parseInt(cleaned, 10) : 0)
  }

  // ── Payment selection ──────────────────────────────────────────────────────

  const handleSelectPayment = (method: PaymentMethod | "tarjeta") => {
    if (method === "tarjeta") {
      setShowCardPicker(true)
      setPaymentMethod(null)
      setTransferConfirmed(false)
      setAmountPaid(0)
      setCustomAmount("")
      return
    }
    setShowCardPicker(false)
    setPaymentMethod(method)
    setTransferConfirmed(false)
    setAmountPaid(0)
    setCustomAmount("")
  }

  const handleSelectCard = (type: "debito" | "credito") => {
    setPaymentMethod(type)
    setShowCardPicker(false)
  }

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        className="ml-auto h-full w-full sm:max-w-md rounded-none liquid-glass-drawer"
        aria-describedby="cart-drawer-desc"
      >
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-white/20 dark:border-white/10 px-5 py-4 shrink-0">
          <div>
            <DrawerTitle className="text-base font-semibold text-foreground">
              Pedido
            </DrawerTitle>
            <DrawerDescription id="cart-drawer-desc" className="text-xs text-muted-foreground">
              {count} {count === 1 ? "producto" : "productos"}
            </DrawerDescription>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            className="flex items-center justify-center size-9 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-colors active:scale-90 border-0"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </DrawerHeader>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground px-4">
            <ShoppingCart className="size-10 opacity-15" />
            <p className="text-sm font-medium">Sin productos</p>
            <p className="text-xs">Agrega productos para comenzar</p>
          </div>
        ) : (
          /* ── All content in ONE scrollable area, no sticky footer ── */
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-none">
            <div className="px-5 pb-8 space-y-0">

              {/* Cart items */}
              <div className="divide-y divide-white/20 dark:divide-white/10">
                {items.map((item) => (
                  <CartItemRow
                    key={item.product.id}
                    item={item}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>

              {/* Clear */}
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/8 transition-colors active:scale-95"
              >
                <Trash2 className="size-3" />
                Vaciar pedido
              </button>

              <div className="h-px bg-white/20 dark:bg-white/10 my-4" />

              {/* Total */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              {/* ── Payment method selector ── */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Método de pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["efectivo", "transferencia"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelectPayment(m)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl",
                        "transition-all duration-200 active:scale-95 min-h-[64px]",
                        paymentMethod === m
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30 liquid-glass-card"
                          : "liquid-glass-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === "efectivo"
                        ? <Banknote className="size-5" />
                        : <Smartphone className="size-5" />
                      }
                      <span className="text-[12px] font-medium">{PAYMENT_LABELS[m]}</span>
                    </button>
                  ))}

                  {/* Tarjeta */}
                  <button
                    onClick={() => handleSelectPayment("tarjeta")}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl",
                      "transition-all duration-200 active:scale-95 min-h-[64px]",
                      (paymentMethod === "debito" || paymentMethod === "credito" || showCardPicker)
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30 liquid-glass-card"
                        : "liquid-glass-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CreditCard className="size-5" />
                    <span className="text-[12px] font-medium">
                      {paymentMethod === "debito"
                        ? "Débito ✓"
                        : paymentMethod === "credito"
                        ? "Crédito ✓"
                        : "Tarjeta"}
                    </span>
                  </button>
                </div>
              </div>

              {/* ── Card type picker ── */}
              {showCardPicker && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCardPicker(false)}
                      className="flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="size-3.5" />
                    </button>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Tipo de tarjeta
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["debito", "credito"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSelectCard(type)}
                        className={cn(
                          "flex flex-col items-center gap-2 py-4 rounded-2xl",
                          "liquid-glass-card text-muted-foreground hover:text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        <CreditCard className="size-5" />
                        <span className="text-[13px] font-semibold">{PAYMENT_LABELS[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Card selected ── */}
              {(paymentMethod === "debito" || paymentMethod === "credito") && !showCardPicker && (
                <div className="mt-4 rounded-2xl p-4 bg-primary/5 ring-1 ring-primary/15 space-y-1 text-center">
                  <CreditCard className="size-6 text-primary mx-auto mb-1" />
                  <p className="text-sm font-semibold text-foreground">
                    Pago con {PAYMENT_LABELS[paymentMethod]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Procesá el pago en el terminal de tarjetas
                  </p>
                  <button
                    onClick={() => setShowCardPicker(true)}
                    className="text-[11px] text-primary/70 hover:text-primary transition-colors"
                  >
                    Cambiar tipo
                  </button>
                </div>
              )}

              {/* ── Efectivo calculator ── */}
              {paymentMethod === "efectivo" && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Paga con
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          className={cn(
                            "h-10 rounded-xl text-[13px] font-semibold tabular-nums",
                            "transition-all duration-150 active:scale-95",
                            amountPaid === amount && !customAmount
                              ? "bg-primary text-primary-foreground"
                              : "liquid-glass-card text-foreground"
                          )}
                        >
                          {formatPrice(amount)}
                        </button>
                      ))}
                      <button
                        onClick={handleExactAmount}
                        className={cn(
                          "h-10 rounded-xl text-[13px] font-semibold",
                          "transition-all duration-150 active:scale-95",
                          amountPaid === total && !customAmount
                            ? "bg-primary text-primary-foreground"
                            : "liquid-glass-card text-foreground"
                        )}
                      >
                        Justo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Monto personalizado
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className={cn(
                          "w-full h-11 pl-8 pr-4 rounded-xl text-right liquid-glass-input",
                          "text-base font-bold tabular-nums",
                          "text-foreground placeholder:text-muted-foreground/30",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20",
                          "transition-all duration-200"
                        )}
                        aria-label="Monto personalizado"
                      />
                    </div>
                  </div>

                  {amountPaid > 0 && (
                    <div className={cn(
                      "text-center py-4 rounded-2xl",
                      amountPaid >= total
                        ? "bg-success/8 ring-1 ring-success/15"
                        : "bg-destructive/8 ring-1 ring-destructive/15"
                    )}>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {amountPaid >= total ? "Vuelto" : "Falta"}
                      </p>
                      <p className={cn(
                        "text-3xl font-black tabular-nums mt-1",
                        amountPaid >= total ? "text-success" : "text-destructive"
                      )}>
                        {amountPaid >= total
                          ? formatPrice(change)
                          : formatPrice(total - amountPaid)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Transferencia: confirm toggle ── */}
              {paymentMethod === "transferencia" && (
                <div className="mt-4">
                  <div className={cn(
                    "rounded-2xl p-4 space-y-3 ring-1 transition-all duration-300",
                    transferConfirmed
                      ? "bg-success/8 ring-success/20"
                      : "bg-primary/5 ring-primary/15"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center justify-center size-10 rounded-xl shrink-0 transition-all duration-300",
                        transferConfirmed ? "bg-success/15" : "bg-primary/10"
                      )}>
                        {transferConfirmed
                          ? <BadgeCheck className="size-5 text-success" />
                          : <Smartphone className="size-5 text-primary" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {transferConfirmed ? "Transferencia confirmada" : "Transferencia pendiente"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {transferConfirmed
                            ? `${formatPrice(total)} recibido`
                            : "Verificá que el cliente haya transferido"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTransferConfirmed((v) => !v)}
                      className={cn(
                        "w-full h-10 rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]",
                        transferConfirmed
                          ? "bg-foreground/8 text-muted-foreground hover:bg-foreground/12"
                          : "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      )}
                    >
                      {transferConfirmed ? "Deshacer confirmación" : "Confirmar recepción"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── CONFIRM SALE BUTTON — inline at the bottom of the flow ── */}
              <ConfirmButton
                canConfirm={canConfirm}
                paymentMethod={paymentMethod}
                onClick={handleConfirmSale}
              />

            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}