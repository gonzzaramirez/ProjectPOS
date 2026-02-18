"use client"

import { useState, useMemo } from "react"
import { sileo } from "sileo"
import { cn } from "@/lib/utils"
import type { CartItem, PaymentMethod } from "@/lib/pos-types"
import { formatPrice, QUICK_AMOUNTS } from "@/lib/pos-types"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { CartItemRow } from "./cart-item-row"
import {
  ShoppingCart,
  Banknote,
  Smartphone,
  Check,
  Trash2,
  X,
} from "lucide-react"

type CartDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  total: number
  count: number
  onUpdate: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  total,
  count,
  onUpdate,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState("")

  const change = useMemo(() => {
    if (paymentMethod === "transferencia") return 0
    return Math.max(0, amountPaid - total)
  }, [amountPaid, total, paymentMethod])

  const canConfirm = useMemo(() => {
    if (!paymentMethod || items.length === 0) return false
    if (paymentMethod === "transferencia") return true
    return amountPaid >= total
  }, [paymentMethod, amountPaid, total, items.length])

  const resetFlow = () => {
    setPaymentMethod(null)
    setAmountPaid(0)
    setCustomAmount("")
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetFlow()
    onOpenChange(val)
  }

  const handleConfirmSale = () => {
    const saleChange = change
    const saleTotal = total
    const saleMethod = paymentMethod

    onClear()
    resetFlow()
    onOpenChange(false)

    sileo.success({
      title: "Venta confirmada",
      description:
        saleMethod === "efectivo" && saleChange > 0
          ? `Total: ${formatPrice(saleTotal)} | Vuelto: ${formatPrice(saleChange)}`
          : `Total: ${formatPrice(saleTotal)}`,
    })
  }

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount)
    setCustomAmount("")
  }

  const handleExactAmount = () => {
    setAmountPaid(total)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "")
    setCustomAmount(cleaned)
    setAmountPaid(cleaned ? parseInt(cleaned, 10) : 0)
  }

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethod(method)
    if (method === "transferencia") {
      setAmountPaid(total)
      setCustomAmount("")
    } else {
      setAmountPaid(0)
      setCustomAmount("")
    }
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        className="ml-auto h-full w-full sm:max-w-md rounded-none liquid-glass-drawer"
        aria-describedby="cart-drawer-desc"
      >
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-white/20 dark:border-white/10 px-5 py-4">
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

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground px-4">
            <ShoppingCart className="size-10 opacity-15" />
            <p className="text-sm font-medium">Sin productos</p>
            <p className="text-xs">Agrega productos para comenzar</p>
          </div>
        ) : (
          <>
            {/* Scrollable area - native scroll */}
            <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-none">
              <div className="px-5 pb-6">
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
                  aria-label="Vaciar pedido"
                >
                  <Trash2 className="size-3" />
                  Vaciar pedido
                </button>

                {/* Divider */}
                <div className="h-px bg-white/20 dark:bg-white/10 my-4" />

                {/* Total */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Payment method */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Metodo de pago
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleSelectPayment("efectivo")}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3.5 rounded-2xl",
                        "transition-all duration-200 active:scale-95",
                        "min-h-[72px]",
                        paymentMethod === "efectivo"
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30 liquid-glass-card"
                          : "liquid-glass-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Banknote className="size-5" />
                      <span className="text-[13px] font-medium">Efectivo</span>
                    </button>
                    <button
                      onClick={() => handleSelectPayment("transferencia")}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3.5 rounded-2xl",
                        "transition-all duration-200 active:scale-95",
                        "min-h-[72px]",
                        paymentMethod === "transferencia"
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30 liquid-glass-card"
                          : "liquid-glass-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Smartphone className="size-5" />
                      <span className="text-[13px] font-medium">Transferencia</span>
                    </button>
                  </div>
                </div>

                {/* Cash calculator */}
                {paymentMethod === "efectivo" && (
                  <div className="mt-4 space-y-3 animate-fade-up">
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

                    {/* Custom amount */}
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
                            "w-full h-11 pl-8 pr-4 rounded-xl text-right",
                            "liquid-glass-input",
                            "text-base font-bold tabular-nums",
                            "text-foreground placeholder:text-muted-foreground/30",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/70",
                            "transition-all duration-200"
                          )}
                          aria-label="Monto personalizado"
                        />
                      </div>
                    </div>

                    {/* Change display */}
                    {amountPaid > 0 && (
                      <div
                        className={cn(
                          "text-center py-4 rounded-2xl animate-scale-in",
                          amountPaid >= total
                            ? "bg-success/8 ring-1 ring-success/15"
                            : "bg-destructive/8 ring-1 ring-destructive/15"
                        )}
                      >
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {amountPaid >= total ? "Vuelto" : "Falta"}
                        </p>
                        <p
                          className={cn(
                            "text-3xl font-black tabular-nums mt-1",
                            amountPaid >= total ? "text-success" : "text-destructive"
                          )}
                        >
                          {amountPaid >= total
                            ? formatPrice(change)
                            : formatPrice(total - amountPaid)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Transfer confirmation */}
                {paymentMethod === "transferencia" && (
                  <div className="mt-4 text-center py-4 rounded-2xl bg-primary/5 ring-1 ring-primary/15 animate-scale-in">
                    <Smartphone className="size-6 text-primary mx-auto mb-1.5" />
                    <p className="text-sm font-medium text-foreground">
                      Confirmar transferencia
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verifica que el cliente haya transferido
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm button - sticky bottom */}
            <div className="shrink-0 border-t border-white/20 dark:border-white/10 p-4 liquid-glass-panel rounded-none border-0">
              <button
                onClick={handleConfirmSale}
                disabled={!canConfirm}
                className={cn(
                  "flex items-center justify-center gap-2 w-full h-13 rounded-2xl",
                  "text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]",
                  canConfirm
                    ? "bg-success text-success-foreground shadow-md shadow-success/20"
                    : "bg-foreground/8 text-muted-foreground cursor-not-allowed"
                )}
                aria-label="Confirmar venta"
              >
                <Check className="size-5" />
                Confirmar Venta
              </button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
