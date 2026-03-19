"use client"

import Image from "next/image"
import { cn } from "@/src/lib/utils"
import type { CartItem } from "@/src/lib/pos-types"
import { formatPrice } from "@/src/lib/pos-types"
import { Minus, Plus, Trash2 } from "lucide-react"

type CartItemRowProps = {
  item: CartItem
  onUpdate: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, onUpdate, onRemove }: CartItemRowProps) {
  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex items-center gap-3 py-3 animate-fade-up">
      {/* Thumbnail */}
      <div className="relative size-11 rounded-xl overflow-hidden shrink-0 border border-white/40 dark:border-white/15 bg-white/30 dark:bg-white/5 shadow-sm">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">
          {item.product.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatPrice(item.product.price)} c/u
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            item.quantity === 1
              ? onRemove(item.product.id)
              : onUpdate(item.product.id, item.quantity - 1)
          }
          className={cn(
            "flex items-center justify-center size-7 rounded-full",
            "transition-all duration-150 active:scale-90",
            item.quantity === 1
              ? "bg-destructive/10 text-destructive"
              : "bg-foreground/5 text-foreground"
          )}
          aria-label={
            item.quantity === 1
              ? `Eliminar ${item.product.name}`
              : `Reducir cantidad de ${item.product.name}`
          }
        >
          {item.quantity === 1 ? (
            <Trash2 className="size-3" />
          ) : (
            <Minus className="size-3" />
          )}
        </button>

        <span className="w-6 text-center text-[13px] font-bold tabular-nums text-foreground">
          {item.quantity}
        </span>

        <button
          onClick={() => onUpdate(item.product.id, item.quantity + 1)}
          className={cn(
            "flex items-center justify-center size-7 rounded-full",
            "bg-primary/10 text-primary",
            "transition-all duration-150 active:scale-90"
          )}
          aria-label={`Agregar mas ${item.product.name}`}
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* Subtotal */}
      <p className="text-[13px] font-semibold tabular-nums text-foreground w-14 text-right">
        {formatPrice(subtotal)}
      </p>
    </div>
  )
}
