export type Period = "hoy" | "semana" | "mes";

export type SaleDataPoint = {
  label: string;
  total: number;
  count: number;
};

export type TopProduct = {
  id: string;
  name: string;
  image: string;
  totalSold: number;
  revenue: number;
};

export type ReportesData = {
  period: Period;
  salesByPeriod: SaleDataPoint[];
  topProducts: TopProduct[];
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  revenueGrowth: number;
};