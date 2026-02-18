"use client";

import { useState, useCallback } from "react";
import { sileo } from "sileo";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/pos-types";
import { PosHeader } from "./pos-header";
import { SearchBar } from "./search-bar";
import { CategoryBar } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";

export function PosTerminal() {
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

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* Top bar: header + search + categories — minimal */}
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

      {/* Scrollable products area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 scrollbar-none">
        <div className="pb-28 pt-4">
          <ProductGrid
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            cartItems={items}
            onAddProduct={handleAddProduct}
          />
        </div>
      </div>

      {/* Floating cart button */}
      <CartButton
        count={count}
        total={total}
        onClick={() => setCartOpen(true)}
      />

      {/* Cart drawer */}
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
    </div>
  );
}
