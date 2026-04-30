"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import {
  ShoppingBag,
  Package,
  ClipboardList,
  BarChart2,
  Shield,
} from "lucide-react"

export type AppSection = "ventas" | "inventario" | "pedidos" | "reportes" | "admin"

const NAV_ITEMS: {
  id: AppSection
  label: string
  icon: React.ElementType
}[] = [
  { id: "ventas",     label: "Ventas",     icon: ShoppingBag   },
  { id: "inventario", label: "Inventario", icon: Package        },
  { id: "pedidos",    label: "Pedidos",    icon: ClipboardList  },
  { id: "reportes",   label: "Reportes",   icon: BarChart2      },
  { id: "admin",      label: "Admin",      icon: Shield         },
]

type BottomNavProps = {
  mode: "admin" | "cajero"
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
}

export function BottomNav({ mode, activeSection, onSectionChange }: BottomNavProps) {
  const items =
    mode === "cajero"
      ? NAV_ITEMS.filter((item) => item.id !== "admin").map((item) =>
          item.id === "reportes" ? { ...item, label: "Caja" } : item,
        )
      : NAV_ITEMS;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 px-2 pb-safe"
      aria-label="Navegación principal"
      role="tablist"
    >
      {/* Glass pill background */}
      <div className="app-surface-dark absolute inset-0 rounded-t-3xl border-t backdrop-blur-xl" />

      <div className="relative z-10 flex w-full justify-around items-end">
      {items.map((item) => {
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
              "flex-1 py-2.5 min-h-[58px]",
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
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-9 rounded-full bg-primary"
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
                scale: isActive ? 1.08 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center justify-center"
            >
              <Icon
                className={cn(
                  "size-[22px] transition-none",
                  isActive ? "text-primary" : "app-text-muted-inverse"
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </motion.span>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] font-medium tracking-tight transition-colors duration-200",
                isActive ? "text-primary" : "app-text-muted-inverse"
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
      </div>
    </nav>
  )
}