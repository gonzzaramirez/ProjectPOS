"use client";

import { apiRequest, withPagination } from "@/src/lib/api";

export const posSdk = {
  markets: {
    list: () => apiRequest("/markets"),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/markets", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/markets/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/markets/${id}`, { method: "DELETE" }),
  },
  points: {
    list: (id_market: number) => apiRequest(`/points?id_market=${id_market}`),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/points", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/points/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/points/${id}`, { method: "DELETE" }),
  },
  users: {
    list: (id_market: number, id_point: number) =>
      apiRequest(`/users?id_market=${id_market}&id_point=${id_point}`),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/users", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/users/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: (id_market: number, id_point: number) =>
      apiRequest(`/category?id_market=${id_market}&id_point=${id_point}`),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/category", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/category/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/category/${id}`, { method: "DELETE" }),
  },
  products: {
    list: async (id_market: number, id_point: number, limit = 200) =>
      withPagination(
        await apiRequest(
          `/products?limit=${limit}&id_market=${id_market}&id_point=${id_point}`,
        ),
      ),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/products", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/products/${id}`, { method: "DELETE" }),
  },
  orders: {
    list: async (id_market: number, id_point: number, limit = 200) =>
      withPagination(
        await apiRequest(
          `/orders?limit=${limit}&id_market=${id_market}&id_point=${id_point}`,
        ),
      ),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/orders", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/orders/${id}`, { method: "DELETE" }),
  },
  shifts: {
    list: (id_market: number, id_point: number) =>
      apiRequest(`/shifts?id_market=${id_market}&id_point=${id_point}`),
    open: (payload: Record<string, unknown>) =>
      apiRequest("/shifts", { method: "POST", body: JSON.stringify(payload) }),
    close: (id: string, payload: Record<string, unknown>) =>
      apiRequest(`/shifts/${id}/close`, { method: "PATCH", body: JSON.stringify(payload) }),
    active: (id_market: number, id_point: number) =>
      apiRequest(`/shifts/active?id_market=${id_market}&id_point=${id_point}`),
  },
  withdrawals: {
    list: (id_market: number, id_point: number) =>
      apiRequest(`/withdrawals?id_market=${id_market}&id_point=${id_point}`),
    create: (payload: Record<string, unknown>) =>
      apiRequest("/withdrawals", { method: "POST", body: JSON.stringify(payload) }),
  },
  dashboard: {
    summary: (id_market: number, id_point: number) =>
      apiRequest(`/dashboard/summary?id_market=${id_market}&id_point=${id_point}`),
    bestSellers: (id_market: number, id_point: number) =>
      apiRequest(`/dashboard/best-sellers?id_market=${id_market}&id_point=${id_point}`),
  },
};
