"use client"

import { cn } from "@/src/lib/utils"
import { CATEGORIES } from "@/src/lib/pos-types"

type CategoryBarProps = {
  activeCategory: string
  onCategoryChange: (id: string) => void
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div
      className="flex gap-1 overflow-x-auto scrollbar-none shrink-0"
      role="tablist"
      aria-label="Categorías"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
              "transition-colors duration-150",
              "active:scale-[0.98]",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
