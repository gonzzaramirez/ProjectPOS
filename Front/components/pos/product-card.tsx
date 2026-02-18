'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Check } from 'lucide-react'
import type { Product } from '@/lib/pos-types'
import { formatPrice } from '@/lib/pos-types'

type ProductCardProps = {
  product: Product
  onAdd: (product: Product) => void
  cartQuantity: number
  index?: number
}

export function ProductCard({ product, onAdd, cartQuantity, index = 0 }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAdd(product)
    setJustAdded(true)
    const t = setTimeout(() => setJustAdded(false), 600)
    return () => clearTimeout(t)
  }

  return (
    <motion.div
      className="w-full max-w-[360px] mx-auto h-full flex"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 30, 240) / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.article
        className="liquid-glass-card overflow-hidden rounded-2xl w-full flex flex-col h-full"
        whileHover={{
          y: -4,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Imagen con overlay suave abajo */}
        <div className="relative w-full aspect-4/3 min-h-[140px] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
            sizes="(max-width: 768px) 50vw, 280px"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, var(--card) 0%, transparent 55%)',
            }}
          />
          {/* Badge cantidad en la imagen */}
          <AnimatePresence>
            {cartQuantity > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute top-2 right-2 flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tabular-nums shadow-md"
              >
                {cartQuantity}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3 flex flex-col flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate mb-1" title={product.name}>
            {product.name}
          </p>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">
              {formatPrice(product.price)}
            </span>
            <motion.button
              type="button"
              onClick={handleAdd}
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="plus"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="sr-only sm:not-sr-only sm:inline">
                {cartQuantity > 0 ? 'Más' : 'Agregar'}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}
