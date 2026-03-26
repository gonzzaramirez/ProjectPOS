/* "use client"

import { motion } from "motion/react"
import { Package, ClipboardList, BarChart2 } from "lucide-react"

// — Shared empty state skeleton ——————————————————————————————————————————

function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-4 px-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="liquid-glass-card flex items-center justify-center size-16 rounded-3xl">
        <Icon className="size-8 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        Próximamente
      </span>
    </motion.div>
  )
}

// — Screens ———————————————————————————————————————————————————————————————

export function InventoryScreen() {
  return (
    <InventoryScreen
      icon={Package}
      title="Inventario"
      description="Gestioná el stock de productos, categorías y precios desde acá."
    />
  )
}

export function OrderScreen() {
  return (
    <OrderScreen
      icon={ClipboardList}
      title="Pedidos"
      description="Historial de ventas y pedidos pendientes aparecerán aquí."
    />
  )
}

export function ReportesScreen() {
  return (
    <ReportesScreen
      icon={BarChart2}
      title="Reportes"
      description="Estadísticas de ventas, productos más vendidos y totales diarios."
    />
  )
} */