import { Routes } from '@angular/router';
import { SalesSummaryComponent } from './pages/sales-summary/sales-summary.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'sales-summary', component: SalesSummaryComponent },
];
