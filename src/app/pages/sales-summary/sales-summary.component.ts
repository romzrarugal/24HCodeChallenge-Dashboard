import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PizzaService } from '../../services/pizza.service';
import { PizzaSummaryDto } from '../../models/pizza-summary.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { BaseChartDirective } from 'ng2-charts';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-pizza',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgSelectModule,
    BaseChartDirective
  ],
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.css']
})
export class SalesSummaryComponent {
  pizzas: PizzaSummaryDto[] = [];
  filteredPizzas: PizzaSummaryDto[] = [];
  page = 1;
  pageSize = 10;
  searchTerm = '';
  expandedIndex: number | null = null;
  isLoading = true;
  allIngredients: string[] = [];
  selectedIngredients: string[] = [];
  totalCount = 0;

  constructor(private pizzaService: PizzaService) {}
  private searchChanged: Subject<string> = new Subject();
  private ingredientFilterChanged = new Subject<string[]>();

  ngOnInit(): void {
    //debounce search to avoid calling the api each keystroke
    this.searchChanged.pipe(
      debounceTime(700)
    ).subscribe(value => {
      this.page = 1;
      this.searchTerm = value;
      this.loadPizzas();
    });

    this.pizzaService.getIngredients().subscribe(list => {
      this.allIngredients = list;
    });

    //debounce filter to be able to select more ingredients
    this.ingredientFilterChanged.pipe(
      debounceTime(700)
    ).subscribe(() => {
      this.page = 1;
      this.loadPizzas();
    });

    this.loadPizzas();
  }

  loadPizzas(): void {
    this.isLoading = true;

    this.pizzaService
      .getPizzaSummaries(
        this.searchTerm,
        this.page,
        this.pageSize,
        this.selectedIngredients,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(res => {
        this.pizzas = res.items;
        this.totalCount = res.totalCount;
        this.filteredPizzas = [...this.pizzas];
        this.isLoading = false;
      });
  }

  onIngredientChange(): void {
    this.ingredientFilterChanged.next(this.selectedIngredients);
  }

  onSearchChange(): void {
    this.searchChanged.next(this.searchTerm);
  }

  onEnterSearch(): void {
    this.page = 1;
    this.loadPizzas(); // immediate search after hitting Enter key (by-passing the debounce)
  }

  extractAllIngredients(): void {
    this.allIngredients = Array.from(
      new Set(
        this.pizzas.flatMap(p => p.ingredients.split(',').map((i: string) => i.trim()))
      )
    ).sort();
  }

  sortColumn: 'name' | 'category' | 'totalSales' | 'quantitySold' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  setSort(column: 'name' | 'category' | 'totalSales' | 'quantitySold') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.page = 1;
    this.loadPizzas(); // fetch sorted from server
  }

  applySort(): void {
    if (!this.sortColumn) return;

    this.filteredPizzas.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (this.sortColumn) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'totalSales':
          aVal = a.totalSales;
          bVal = b.totalSales;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return this.sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  applyFilter(): void {
    const filtered = this.pizzas.filter(p => {
      const pizzaIngredients = p.ingredients
        .split(',')
        .map((i: string) => i.trim().toLowerCase());

      return (
        this.selectedIngredients.length === 0 ||
        this.selectedIngredients.some(ing =>
          pizzaIngredients.includes(ing.toLowerCase())
        )
      );
    });

    this.filteredPizzas = filtered;
    this.sortColumn && this.applySort();
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  toggleDetails(index: number) {
    const pizza = this.filteredPizzas[index];

    if (this.expandedIndex === index) {
      this.expandedIndex = null;
      return;
    }

    this.expandedIndex = index;

    if (!pizza.insight) {
      this.pizzaService.getPizzaInsight(pizza.pizzaId).subscribe(insight => {
        pizza.insight = insight;
      });
    }
  }

  getBarChartData(pizza: PizzaSummaryDto) {
    if (!pizza.insight) return undefined;
    return {
      labels: Object.keys(pizza.insight.salesPerSize),
      datasets: [
        {
          data: Object.values(pizza.insight.salesPerSize),
          label: 'Sales by Size',
          backgroundColor: '#42A5F5'
        }
      ]
    };
  }

  getLineChartData(pizza: PizzaSummaryDto) {
    if (!pizza.insight) return undefined;
    const sortedMonths = Object.keys(pizza.insight.monthlySales || {}).sort();
    return {
      labels: sortedMonths,
      datasets: [
        {
          data: sortedMonths.map(month => pizza.insight!.monthlySales[month]),
          label: 'Monthly Sales',
          borderColor: '#66BB6A',
          backgroundColor: 'rgba(102,187,106,0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }

  getQuantityLineChartData(pizza: PizzaSummaryDto) {
    if (!pizza.insight) return undefined;
    const quantity = pizza.insight.quantityPerMonth || {};
    const months = Object.keys(quantity).sort();

    return {
      labels: months,
      datasets: [
        {
          label: 'Quantity Sold',
          data: months.map(month => quantity[month]),
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255,167,38,0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  }
}
