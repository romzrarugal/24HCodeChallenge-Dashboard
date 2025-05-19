import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummaryDto } from '../../models/dashboard-summary.model';
import { PizzaChartDataDto } from '../../models/pizza-chart.model';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ChartData, ChartOptions, ChartType, TooltipItem,  } from 'chart.js';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective
  ],
})
export class DashboardComponent implements OnInit {
  summary!: DashboardSummaryDto;
  chartData: PizzaChartDataDto[] = [];
  selectedCategoryIndex = 0;
  ChartDataLabels = ChartDataLabels;

  isSummaryLoading = true;
  isChartLoading = true;

  combinedPieChartData!: ChartData<'pie', number[], string>;
  combinedPieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const pizza = this.chartData[this.selectedCategoryIndex].pizzas[index];
            const quantity = pizza.quantitySold;
            const sales = pizza.totalSales;
            const label = `${quantity} pcs sold • $${sales.toFixed(2)}`;
            return label;
          }
        }
      },
      datalabels: {
        formatter: (value: number, context: any) => {
          const total = context.chart._metasets[0].total;
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: '#fff',
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadChartData();
  }

  loadSummary(): void {
    this.dashboardService.getSummary().subscribe({
      next: data => {
        this.summary = data;
        this.isSummaryLoading = false;
      },
      error: () => this.isSummaryLoading = false
    });
  }

  loadChartData(): void {
    this.dashboardService.getChartData().subscribe({
      next: data => {
        this.chartData = data;
        this.isChartLoading = false;
        this.updateCombinedPieChart();
      },
      error: () => this.isChartLoading = false
    });
  }

  updateCombinedPieChart(): void {
    const category = this.chartData[this.selectedCategoryIndex];
    const data = category.pizzas.map(p => p.quantitySold); // Or choose a base metric

    this.combinedPieChartData = {
      labels: category.pizzas.map(p => p.pizzaName),
      datasets: [
        {
          data,
          label: 'Pizza Breakdown',
          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997']
        }
      ]
    };
  }
}
