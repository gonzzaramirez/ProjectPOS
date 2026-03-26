"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import { PRODUCTS, type Product } from "@/src/lib/pos-types"
import type { CartItem } from "@/src/lib/pos-types"
import { ProductCard } from "./product-card"

type ProductGridProps = {
  activeCategory: string
  searchQuery: string
  cartItems: CartItem[]
  onAddProduct: (product: Product) => void
  onRemoveProduct?: (product: Product) => void  // ← nuevo
}

export function ProductGrid({
  activeCategory,
  searchQuery,
  cartItems,
  onAddProduct,
  onRemoveProduct,
}: ProductGridProps) {
  const filteredProducts = useMemo(() => {
    let products = PRODUCTS

    if (activeCategory !== "todos") {
      products = products.filter((p) => p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      products = products.filter((p) => p.name.toLowerCase().includes(q))
    }

    return products
  }, [activeCategory, searchQuery])

  const cartMap = useMemo(() => {
    const map = new Map<string, number>()
    cartItems.forEach((i) => map.set(i.product.id, i.quantity))
    return map
  }, [cartItems])

  if (filteredProducts.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="liquid-glass-card px-8 py-8 text-center max-w-sm flex flex-col items-center gap-3"
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <span className="flex items-center justify-center size-12 rounded-2xl bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">Sin resultados</p>
            <p className="text-sm mt-1 text-muted-foreground">
              Probá con otra búsqueda o categoría
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {filteredProducts.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAddProduct}
          onRemove={onRemoveProduct}
          cartQuantity={cartMap.get(product.id) ?? 0}
          index={i}
        />
      ))}
    </div>
  )
}