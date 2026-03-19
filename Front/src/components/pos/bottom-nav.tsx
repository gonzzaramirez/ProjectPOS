"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import {
  ShoppingBag,
  Package,
  ClipboardList,
  BarChart2,
} from "lucide-react"

export type AppSection = "ventas" | "inventario" | "pedidos" | "reportes"

const NAV_ITEMS: {
  id: AppSection
  label: string
  icon: React.ElementType
}[] = [
  { id: "ventas",     label: "Ventas",     icon: ShoppingBag   },
  { id: "inventario", label: "Inventario", icon: Package        },
  { id: "pedidos",    label: "Pedidos",    icon: ClipboardList  },
  { id: "reportes",   label: "Reportes",   icon: BarChart2      },
]

type BottomNavProps = {
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex justify-around items-end pb-safe"
      aria-label="Navegación principal"
      role="tablist"
    >
      {/* Glass pill background */}
      <div className="absolute inset-0 liquid-glass-panel border-t border-white/20 dark:border-white/10" />

      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id
        const Icon = item.icon

        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "relative z-10 flex flex-col items-center justify-center gap-0.5",
              "flex-1 py-2.5 min-h-[56px]",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "active:scale-95"
            )}
          >
            {/* Active indicator dot above icon */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.span
              animate={{
                color: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)",
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center justify-center"
            >
              <Icon
                className={cn(
                  "size-[22px] transition-none",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </motion.span>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] font-medium tracking-tight transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}