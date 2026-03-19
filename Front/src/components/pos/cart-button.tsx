"use client"

import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/pos-types"
import { ShoppingCart } from "lucide-react"

type CartButtonProps = {
  count: number
  total: number
  onClick: () => void
}

export function CartButton({ count, total, onClick }: CartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-16 right-6 z-40",
        "flex items-center gap-3 px-5 h-14 rounded-2xl",
        "liquid-glass-float text-foreground font-semibold",
        "border border-white/40 dark:border-white/15",
        "transition-all duration-300 ease-out active:scale-[0.98]",
        count > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
      aria-label={`Ver carrito con ${count} items, total ${formatPrice(total)}`}
    >
      <div className="relative">
        <ShoppingCart className="size-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2.5 flex items-center justify-center size-[18px] rounded-full bg-white text-primary text-[10px] font-bold animate-scale-in">
            {count}
          </span>
        )}
      </div>
      <span className="text-sm font-bold tabular-nums text-primary">{formatPrice(total)}</span>
    </button>
  )
}
