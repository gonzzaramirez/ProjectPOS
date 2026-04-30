"use client";

import { useMemo, useState } from "react";
import { formatPrice, type Product } from "@/src/lib/pos-types";
import { SearchBar } from "@/src/components/pos/search-bar";

type InventoryRealProps = {
  products: Product[];
  onUpdateStock: (product: Product, nextStock: number) => Promise<void>;
};

export function InventoryReal({ products, onUpdateStock }: InventoryRealProps) {
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const updateStock = async (product: Product, delta: number) => {
    const next = Math.max(0, product.stock + delta);
    setSavingId(product.id);
    try {
      await onUpdateStock(product, next);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden pb-16">
      <div className="app-surface-dark border-b px-4 py-3">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="app-card rounded-2xl p-3 shadow-md"
            >
              <div className="mb-2 min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(product.price)} · Stock actual {product.stock}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="app-badge rounded-full px-3 py-1 text-xs font-semibold">
                  SKU {product.id_product}
                </span>
                <div className="flex items-center gap-2">
                <button
                  onClick={() => void updateStock(product, -1)}
                  className="app-btn-icon h-10 w-10 rounded-full transition"
                  disabled={savingId === product.id || product.stock === 0}
                >
                  -
                </button>
                <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
                  {product.stock}
                </span>
                <button
                  onClick={() => void updateStock(product, +1)}
                  className="app-btn-icon-primary h-10 w-10 rounded-full transition"
                  disabled={savingId === product.id}
                >
                  +
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
