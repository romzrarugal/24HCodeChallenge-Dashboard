export interface PizzaChartItemDto {
  pizzaName: string;
  quantitySold: number;
  totalSales: number;
}

export interface PizzaChartDataDto {
  category: string;
  pizzas: PizzaChartItemDto[];
}
