"use client";

import { useState, useCallback } from "react";
import { sileo } from "sileo";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/src/lib/cart-store";
import type { Product } from "@/src/lib/pos-types";
import { usePosData } from "@/src/hooks/use-pos-data";
import { PosHeader } from "./pos-header";
import { SearchBar } from "./search-bar";
import { CategoryBar } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";
import { BottomNav, type AppSection } from "./bottom-nav";
import { InventoryReal } from "@/components/inventory/InventoryReal";
import { OrderScreen } from "../orders/Orders";
import { ReportsReal } from "../reports/ReportsReal";
import { AdminCrudScreen } from "@/src/components/admin/admin-crud-screen";
import { CashierOps } from "@/src/components/cashier/cashier-ops";

type PosTerminalProps = {
  mode?: "admin" | "cajero";
};

export function PosTerminal({ mode = "admin" }: PosTerminalProps) {
  const [activeSection, setActiveSection] = useState<AppSection>("ventas");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const { items, add, remove, update, clear, total, count } = useCart();
  const {
    loading,
    error,
    products,
    categories,
    orders,
    reports,
    createOrder,
    updateOrderStatus,
    updateProductStock,
  } = usePosData();

  const handleAddProduct = useCallback(
    (product: Product) => {
      add(product);
      sileo.success({
        title: product.name,
        description: "Agregado al pedido",
      });
    },
    [add],
  );

  const handleRemoveProduct = useCallback(
    (product: Product) => {
      const item = items.find((i) => i.product.id === product.id);
      if (!item) return;
      if (item.quantity === 1) {
        remove(product.id);
      } else {
        update(product.id, item.quantity - 1);
      }
    },
    [items, remove, update],
  );

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  const handleConfirmSale = useCallback(
    async ({
      paymentMethod,
    }: {
      paymentMethod: "efectivo" | "transferencia" | "debito" | "credito";
      amountPaid: number;
    }) => {
      if (items.length === 0) return;
      await createOrder({
        clientName: "Consumidor Final",
        paymentMethod,
        total,
        items: items.map((i) => ({
          id_product: i.product.id_product,
          quantity: i.quantity,
          price_at_sale: i.product.price,
        })),
      });
    },
    [createOrder, items, total],
  );

  const visibleSection =
    mode === "cajero" && (activeSection === "admin" || activeSection === "reportes")
      ? "ventas"
      : activeSection;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-transparent">
      <AnimatePresence mode="wait" initial={false}>

        {/* ── Ventas ────────────────────────────────────── */}
        {visibleSection === "ventas" && (
          <motion.div
            key="ventas"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="z-20 shrink-0 px-2 pt-2">
              <div className="liquid-glass-panel rounded-3xl border border-white/20">
              <div className="px-4 py-2.5 space-y-2.5">
                <PosHeader />
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  </div>
                  <CategoryBar
                  categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </div>
              </div>
              </div>
            </div>

            <div className="scrollbar-none flex-1 overflow-y-auto overscroll-contain px-4">
              <div className="pb-36 pt-4">
                <ProductGrid
                  products={products}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  cartItems={items}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                />
              </div>
            </div>

            <CartButton
              count={count}
              total={total}
              onClick={() => setCartOpen(true)}
            />

            <CartDrawer
              open={cartOpen}
              onOpenChange={setCartOpen}
              items={items}
              total={total}
              count={count}
              onUpdate={update}
              onRemove={remove}
              onClear={handleClear}
              onConfirmSale={handleConfirmSale}
            />
          </motion.div>
        )}

        {/* ── Inventario ────────────────────────────────── */}
        {visibleSection === "inventario" && (
          <motion.div
            key="inventario"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="z-20 shrink-0 px-2 pt-2">
              <div className="app-surface-dark rounded-3xl border px-4 py-2.5">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
              </div>
            </div>
            <InventoryReal
              products={products}
              onUpdateStock={(product, nextStock) =>
                updateProductStock(product.id_product, nextStock, product)
              }
            />
          </motion.div>
        )}

        {/* ── Pedidos ───────────────────────────────────── */}
        {visibleSection === "pedidos" && (
          <motion.div
            key="pedidos"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="z-20 shrink-0 px-2 pt-2">
              <div className="app-surface-dark rounded-3xl border px-4 py-2.5">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
              </div>
            </div>
            <OrderScreen orders={orders} onStatusChange={updateOrderStatus} />
          </motion.div>
        )}

        {/* ── Reportes ──────────────────────────────────── */}
        {visibleSection === "reportes" && (
          <motion.div
            key="reportes"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="z-20 shrink-0 px-2 pt-2">
              <div className="app-surface-dark rounded-3xl border px-4 py-2.5">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
              </div>
            </div>
            {mode === "cajero" ? <CashierOps /> : <ReportsReal data={reports} />}
          </motion.div>
        )}

        {/* ── Admin CRUD ────────────────────────────────── */}
        {visibleSection === "admin" && mode === "admin" && (
          <motion.div
            key="admin"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="z-20 shrink-0 px-2 pt-2">
              <div className="app-surface-dark rounded-3xl border px-4 py-2.5">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
              </div>
            </div>
            <AdminCrudScreen />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Bottom navigation ─────────────────────────── */}
      <BottomNav
        mode={mode}
        activeSection={visibleSection}
        onSectionChange={setActiveSection}
      />
      {loading ? (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 text-xs rounded-full liquid-glass-pill px-3 py-1.5">
          Sincronizando con backend...
        </div>
      ) : null}
      {error ? (
        <div className="fixed top-3 right-3 max-w-xs text-xs rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive backdrop-blur-md">
          {error}
        </div>
      ) : null}
    </div>
  );
}