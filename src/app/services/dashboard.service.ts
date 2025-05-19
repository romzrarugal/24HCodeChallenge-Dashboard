import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummaryDto } from '../models/dashboard-summary.model';
import { PizzaChartDataDto } from '../models/pizza-chart.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'https://localhost:7202/api/Dashboard';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummaryDto> {
    return this.http.get<DashboardSummaryDto>(`${this.apiUrl}/summary`);
  }
  getChartData(): Observable<PizzaChartDataDto[]> {
    return this.http.get<PizzaChartDataDto[]>(`${this.apiUrl}/charts`);
  }
}
