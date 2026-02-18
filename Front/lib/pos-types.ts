export type Category = {
  id: string;
  label: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
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
const PLACEHOLDER =
  "https://www.megasistema.com.br/public/assets/front-end/img/placeholder-image-sq.png";

export const CATEGORIES: Category[] = [
  { id: "todos", label: "Todos", icon: "grid" },
  { id: "bebidas", label: "Bebidas", icon: "cup-soda" },
  { id: "gaseosas", label: "Gaseosas", icon: "glass-water" },
  { id: "cervezas", label: "Cervezas", icon: "beer" },
  { id: "tragos", label: "Tragos", icon: "wine" },
  { id: "comidas", label: "Comidas", icon: "utensils" },
  { id: "snacks", label: "Snacks", icon: "cookie" },
];

export const PRODUCTS: Product[] = [
  // Bebidas
  // Nuevos Productos (placeholder image)

  {
    id: "choripan-simple",
    name: "Choripan",
    price: 3500,
    category: "comidas",
    image: PLACEHOLDER,
  },
  {
    id: "panchos",
    name: "Panchos",
    price: 2500,
    category: "comidas",
    image: PLACEHOLDER,
  },
  {
    id: "hamburguesa-simple",
    name: "Hamburguesa",
    price: 5000,
    category: "comidas",
    image: PLACEHOLDER,
  },

  {
    id: "vodka-speed",
    name: "Vodka con Speed",
    price: 4500,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "vodka",
    name: "Vodka",
    price: 4000,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "fernet",
    name: "Fernet",
    price: 4000,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "gancia",
    name: "Gancia",
    price: 3500,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "vino-blanco-speed",
    name: "Vino Blanco + Speed",
    price: 4000,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "vino-tinto-coca",
    name: "Vino Tinto con Coca",
    price: 3500,
    category: "tragos",
    image: PLACEHOLDER,
  },
  {
    id: "whiscola",
    name: "Whiscola",
    price: 4500,
    category: "tragos",
    image: PLACEHOLDER,
  },

  {
    id: "cerveza-amstel",
    name: "Cerveza Amstel",
    price: 3000,
    category: "cervezas",
    image: PLACEHOLDER,
  },
  {
    id: "cerveza-shenider",
    name: "Cerveza Shenider",
    price: 2800,
    category: "cervezas",
    image: PLACEHOLDER,
  },
  {
    id: "cerveza-heineken",
    name: "Cerveza Heineken",
    price: 3200,
    category: "cervezas",
    image: PLACEHOLDER,
  },

  {
    id: "gaseosa-chica",
    name: "Gaseosa Chica",
    price: 1500,
    category: "gaseosas",
    image: PLACEHOLDER,
  },
  {
    id: "coca-sprite-fanta-aquarius",
    name: "Coca / Sprite / Fanta / Aquarius",
    price: 1500,
    category: "gaseosas",
    image: PLACEHOLDER,
  },
  {
    id: "agua-chica",
    name: "Agua Chica",
    price: 800,
    category: "bebidas",
    image: PLACEHOLDER,
  },
  {
    id: "agua-grande-2-5",
    name: "Agua 2.5L",
    price: 2000,
    category: "bebidas",
    image: PLACEHOLDER,
  },
  {
    id: "gaseosa-grande-1-5",
    name: "Gaseosa 1.5L (Coca / Sprite)",
    price: 2800,
    category: "gaseosas",
    image: PLACEHOLDER,
  },

  {
    id: "speed",
    name: "Speed",
    price: 2500,
    category: "bebidas",
    image: PLACEHOLDER,
  },
  {
    id: "monster",
    name: "Monster",
    price: 2800,
    category: "bebidas",
    image: PLACEHOLDER,
  },
];

export const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000];

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}
