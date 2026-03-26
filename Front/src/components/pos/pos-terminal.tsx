"use client";

import { useState, useCallback } from "react";
import { sileo } from "sileo";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/src/lib/cart-store";
import type { Product } from "@/src/lib/pos-types";
import { PosHeader } from "./pos-header";
import { SearchBar } from "./search-bar";
import { CategoryBar } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";
import { BottomNav, type AppSection } from "./bottom-nav";
import { InventoryScreen } from "@/components/inventory/Inventory";
import { OrderScreen } from "../orders/Orders";
import { ReportsScreen } from "../reports/Reports";

export function PosTerminal() {
  const [activeSection, setActiveSection] = useState<AppSection>("ventas");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const { items, add, remove, update, clear, total, count } = useCart();

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

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>

        {/* ── Ventas ────────────────────────────────────── */}
        {activeSection === "ventas" && (
          <motion.div
            key="ventas"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="shrink-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
              <div className="px-4 py-2.5 space-y-2.5">
                <PosHeader />
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  </div>
                  <CategoryBar
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 scrollbar-none">
              <div className="pb-36 pt-4">
                <ProductGrid
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
            />
          </motion.div>
        )}

        {/* ── Inventario ────────────────────────────────── */}
        {activeSection === "inventario" && (
          <motion.div
            key="inventario"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="shrink-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
            </div>
            <InventoryScreen />
          </motion.div>
        )}

        {/* ── Pedidos ───────────────────────────────────── */}
        {activeSection === "pedidos" && (
          <motion.div
            key="pedidos"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="shrink-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
            </div>
            {/* Pass orders + onStatusChange from your OrdersContext here */}
            <OrderScreen />
          </motion.div>
        )}

        {/* ── Reportes ──────────────────────────────────── */}
        {activeSection === "reportes" && (
          <motion.div
            key="reportes"
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="shrink-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
              <div className="px-4 py-2.5">
                <PosHeader />
              </div>
            </div>
            {/* Pass data prop from your analytics context/store here */}
            <ReportsScreen />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Bottom navigation ─────────────────────────── */}
      <BottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}