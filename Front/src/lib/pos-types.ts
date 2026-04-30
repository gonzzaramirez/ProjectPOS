export type Category = {
  id: string;
  label: string;
};

export type Product = {
  id: string;
  id_product: number;
  name: string;
  price: number;
  category: string;
  id_category: number;
  stock: number;
  image: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type PaymentMethod = "efectivo" | "transferencia";

export type Sale = {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  timestamp: Date;
};
export const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000];

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}
