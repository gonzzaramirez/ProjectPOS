'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Check, Minus, Trash2 } from 'lucide-react'
import type { Product } from '@/src/lib/pos-types'
import { formatPrice } from '@/src/lib/pos-types'

type ProductCardProps = {
  product: Product
  onAdd: (product: Product) => void
  onRemove?: (product: Product) => void
  cartQuantity: number
  index?: number
}

export function ProductCard({
  product,
  onAdd,
  onRemove,
  cartQuantity,
  index = 0,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAdd(product)
    setJustAdded(true)
    const t = setTimeout(() => setJustAdded(false), 600)
    return () => clearTimeout(t)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove?.(product)
  }

  const showStepper = cartQuantity > 0 && !!onRemove

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
        whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Imagen */}
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
            style={{ background: 'linear-gradient(to top, var(--card) 0%, transparent 55%)' }}
          />

          {/* Badge cantidad — solo cuando NO hay stepper visible */}
          <AnimatePresence>
            {cartQuantity > 0 && !showStepper && (
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

        {/* Footer */}
        <div className="p-3 flex flex-col flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate mb-1" title={product.name}>
            {product.name}
          </p>

          <AnimatePresence mode="wait" initial={false}>

            {/* ── Stepper (cuando hay items en el carrito) ── */}
            {showStepper ? (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="flex items-center justify-between gap-2 mt-auto"
              >
                {/* Precio con subtotal en pequeño debajo */}
                <div className="flex flex-col min-w-0">
                  <span className="text-xl font-bold text-foreground tabular-nums tracking-tight leading-tight">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    total {formatPrice(product.price * cartQuantity)}
                  </span>
                </div>

                {/* Controles − qty + */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Minus / Trash */}
                  <motion.button
                    type="button"
                    onClick={handleRemove}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center justify-center size-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/30"
                    aria-label={`Quitar ${product.name} del carrito`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {cartQuantity === 1 ? (
                        <motion.span
                          key="trash"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-center"
                        >
                          <Trash2 className="size-3.5" strokeWidth={2.5} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="minus"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-center"
                        >
                          <Minus className="size-3.5" strokeWidth={2.5} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Quantity number */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={cartQuantity}
                      initial={{ opacity: 0, y: -8, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-7 text-center text-base font-black tabular-nums text-foreground select-none"
                    >
                      {cartQuantity}
                    </motion.span>
                  </AnimatePresence>

                  {/* Plus */}
                  <motion.button
                    type="button"
                    onClick={handleAdd}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center justify-center size-9 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Agregar otro ${product.name}`}
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </motion.button>
                </div>
              </motion.div>
            ) : (

            /* ── Botón simple (sin items) ── */
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="flex items-center justify-between gap-2 mt-auto"
              >
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
                  <span className="sr-only sm:not-sr-only sm:inline">Agregar</span>
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.article>
    </motion.div>
  )
}