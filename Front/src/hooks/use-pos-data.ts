"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, getSession } from "@/src/lib/api";
import { posSdk } from "@/src/lib/api/pos-sdk";
import type { Category, Product } from "@/src/lib/pos-types";
import type { Order } from "@/src/components/orders/Orders";
import type { ReportesData } from "@/src/components/reports/Reports";

type BackendProduct = {
  id_product: number;
  product_name: string;
  price: number;
  stock: number;
  id_category: number;
  category?: { category?: string };
};

type BackendOrder = {
  id_order: number;
  order_number: number;
  client_name: string;
  created_at: string;
  status: "Pendiente" | "Preparado" | "Entregado" | "Cancelado";
  payment_method: "Efectivo" | "Digital";
  total: number;
  items: {
    quantity: number;
    price_at_sale: number;
    product?: { product_name?: string };
  }[];
};

const PLACEHOLDER_IMAGE =
  "https://www.megasistema.com.br/public/assets/front-end/img/placeholder-image-sq.png";

const ORDER_STATUS_MAP = {
  Pendiente: "pending",
  Preparado: "preparing",
  Entregado: "delivered",
  Cancelado: "pending",
} as const;

const NEXT_STATUS_MAP = {
  pending: "Preparado",
  preparing: "Entregado",
  ready: "Entregado",
  delivered: "Entregado",
} as const;

function slugifyCategory(value?: string): string {
  return (value ?? "sin-categoria")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapProducts(data: BackendProduct[]): Product[] {
  return data.map((p) => {
    const categoryName = p.category?.category ?? "Sin categoria";
    return {
      id: String(p.id_product),
      id_product: p.id_product,
      name: p.product_name,
      price: p.price,
      category: slugifyCategory(categoryName),
      id_category: p.id_category,
      stock: p.stock,
      image: PLACEHOLDER_IMAGE,
    };
  });
}

function mapOrders(data: BackendOrder[]): Order[] {
  return data.map((o) => ({
    id: String(o.id_order),
    orderNumber: o.order_number,
    customerName: o.client_name,
    timestamp: o.created_at,
    status: ORDER_STATUS_MAP[o.status] ?? "pending",
    paymentMethod: o.payment_method === "Efectivo" ? "cash" : "transfer",
    items: o.items.map((item, idx) => ({
      id: `${o.id_order}-${idx}`,
      name: item.product?.product_name ?? "Producto",
      image: "🧾",
      price: item.price_at_sale,
      quantity: item.quantity,
    })),
    total: o.total,
  }));
}

export function usePosData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<ReportesData | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        throw new Error("Sin sesión activa.");
      }
      const [productsResponse, ordersResponse, summaryResponse, bestSellers] =
        await Promise.all([
          posSdk.products.list(session.user.id_market, session.user.id_point),
          posSdk.orders.list(session.user.id_market, session.user.id_point),
          posSdk.dashboard.summary(
            session.user.id_market,
            session.user.id_point,
          ) as Promise<{
            total_sales: number;
            total_orders: number;
            average_ticket: number;
          }>,
          posSdk.dashboard.bestSellers(
            session.user.id_market,
            session.user.id_point,
          ) as Promise<
            {
              id_product: number;
              product_name: string;
              total_quantity: number;
              average_price: number;
            }[]
          >,
        ]);

      setProducts(mapProducts(productsResponse.data));
      setOrders(mapOrders(ordersResponse.data));

      setReports({
        period: "hoy",
        totalRevenue: summaryResponse.total_sales,
        totalOrders: summaryResponse.total_orders,
        averageTicket: summaryResponse.average_ticket,
        revenueGrowth: 0,
        salesByPeriod: [
          {
            label: "Hoy",
            total: summaryResponse.total_sales,
            count: summaryResponse.total_orders,
          },
        ],
        topProducts: bestSellers.map((p) => ({
          id: String(p.id_product),
          name: p.product_name,
          image: "🏆",
          totalSold: p.total_quantity,
          revenue: p.total_quantity * p.average_price,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categories: Category[] = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((p) => {
      if (!unique.has(p.category)) unique.set(p.category, p.category);
    });
    return [
      { id: "todos", label: "Todos" },
      ...Array.from(unique.keys()).map((key) => ({
        id: key,
        label: key
          .split("-")
          .map((w) => `${w[0]?.toUpperCase() ?? ""}${w.slice(1)}`)
          .join(" "),
      })),
    ];
  }, [products]);

  const createOrder = useCallback(
    async (params: {
      clientName: string;
      paymentMethod: "efectivo" | "transferencia" | "debito" | "credito";
      items: { id_product: number; quantity: number; price_at_sale: number }[];
      total: number;
    }) => {
      const session = await getSession();
      if (!session) throw new Error("Sin sesión activa.");
      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          uuid: crypto.randomUUID(),
          client_name: params.clientName,
          total: params.total,
          payment_method:
            params.paymentMethod === "efectivo" ? "Efectivo" : "Digital",
          id_point: session.user.id_point,
          id_market: session.user.id_market,
          items: params.items,
        }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: "pending" | "preparing" | "ready" | "delivered") => {
      await apiRequest(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: NEXT_STATUS_MAP[status] }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateProductStock = useCallback(
    async (idProduct: number, nextStock: number, currentProduct: Product) => {
      const session = await getSession();
      if (!session) throw new Error("Sin sesión activa.");
      await apiRequest(`/products/${idProduct}`, {
        method: "PATCH",
        body: JSON.stringify({
          stock: nextStock,
          product_name: currentProduct.name,
          price: currentProduct.price,
          id_category: currentProduct.id_category,
          id_point: session.user.id_point,
          id_market: session.user.id_market,
        }),
      });
      await refresh();
    },
    [refresh],
  );

  return {
    loading,
    error,
    products,
    categories,
    orders,
    reports,
    refresh,
    createOrder,
    updateOrderStatus,
    updateProductStock,
  };
}
