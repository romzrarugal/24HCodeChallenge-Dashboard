import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PizzaSummaryDto, PizzaInsightDto } from '../models/pizza-summary.model'
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PizzaService {
  private readonly apiUrl = 'https://localhost:7202/api/Pizza';

  constructor(private http: HttpClient) {}

  getPizzaSummaries(
    search: string = '',
    page: number = 1,
    pageSize: number = 10,
    ingredients: string[] = [],
    sortBy: string = 'name',
    sortDirection: 'asc' | 'desc' = 'asc'
  ) {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (ingredients.length > 0) {
      params = params.set('ingredients', ingredients.join(','));
    }

    return this.http.get<{ totalCount: number; items: PizzaSummaryDto[] }>(
      `${this.apiUrl}`, { params }
    );
  }

  getPizzaInsight(pizzaId: string) {
    return this.http.get<PizzaInsightDto>(`${this.apiUrl}/${pizzaId}/insight`);
  }

  getIngredients() {
    return this.http.get<string[]>(`${this.apiUrl}/ingredients`);
  }
}
