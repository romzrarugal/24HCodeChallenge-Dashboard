export interface DashboardSummaryDto {
  totalSales: number;
  totalQuantitySold: number;
  totalOrders: number;
  bestSellers: BestSellerDto[];
}

export interface BestSellerDto {
  category: string;
  pizzaName: string;
  quantitySold: number;
  totalSales: number;
}
