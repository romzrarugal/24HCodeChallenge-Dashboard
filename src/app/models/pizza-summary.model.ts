export interface PizzaInsightDto {
  salesPerSize: { [size: string]: number };
  monthlySales: { [month: string]: number };
  quantityPerMonth: { [month: string]: number };
}

export interface PizzaSummaryDto {
  pizzaId: string;
  name: string;
  category: string;
  ingredients: string;
  quantitySold: number;
  totalSales: number;
  insight?: PizzaInsightDto;
}
