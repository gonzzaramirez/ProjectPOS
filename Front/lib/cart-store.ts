import { useCallback, useSyncExternalStore } from "react"
import type { CartItem, Product } from "./pos-types"

type CartState = {
  items: CartItem[]
}

type Listener = () => void

let state: CartState = { items: [] }
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function getSnapshot(): CartItem[] {
  return state.items
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addToCart(product: Product) {
  const existing = state.items.find((i) => i.product.id === product.id)
  if (existing) {
    state = {
      items: state.items.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ),
    }
  } else {
    state = {
      items: [...state.items, { product, quantity: 1 }],
    }
  }
  emit()
}

export function removeFromCart(productId: string) {
  state = {
    items: state.items.filter((i) => i.product.id !== productId),
  }
  emit()
}

export function updateQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId)
    return
  }
  state = {
    items: state.items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    ),
  }
  emit()
}

export function clearCart() {
  state = { items: [] }
  emit()
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const add = useCallback((product: Product) => addToCart(product), [])
  const remove = useCallback((productId: string) => removeFromCart(productId), [])
  const update = useCallback(
    (productId: string, qty: number) => updateQuantity(productId, qty),
    []
  )
  const clear = useCallback(() => clearCart(), [])
  const total = getCartTotal(items)
  const count = getCartCount(items)

  return { items, add, remove, update, clear, total, count }
}
