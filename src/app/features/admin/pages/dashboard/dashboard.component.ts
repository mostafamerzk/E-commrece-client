import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminStat, AdminOrderQueryParams } from '../../../../core/models/admin.model';
import { Order } from '../../../../core/models/order.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  router = inject(Router);

  stats = signal<AdminStat[]>([]);
  recentOrders = signal<Order[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  adminName = computed(() => this.authService.currentUser()?.userName ?? 'Admin');

  chartPeriod = signal<'7d' | '30d' | '90d'>('30d');
  chartPeriods: { label: string; value: '7d' | '30d' | '90d' }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
  ];

  constructor() {
    // Reload data when chart period changes
    effect(() => {
      this.chartPeriod();
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    const period = this.chartPeriod();
    const { startDate, endDate } = this.getPeriodDates(period);

    this.isLoading.set(true);
    this.error.set(null);

    const statsParams = { startDate, endDate };
    const orderParams: AdminOrderQueryParams = {
      startDate,
      endDate,
      limit: '5',
      sort: 'newest',
    };

    forkJoin({
      stats: this.adminService.getStats(statsParams),
      orders: this.adminService.getRecentOrders(orderParams),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.stats.set(data.stats.stats);
          this.recentOrders.set(data.orders.orders);
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
          this.error.set('Failed to load dashboard data. Please try again.');
        },
      });
  }

  private getPeriodDates(period: '7d' | '30d' | '90d'): {
    startDate: string;
    endDate: string;
  } {
    const end = new Date();
    const start = new Date();
    let days = 30;

    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;

    start.setDate(end.getDate() - days);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }

  getStatusBadgeClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-700';
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') {
      return 'bg-green-100 text-green-700';
    }
    if (statusLower === 'pending' || statusLower === 'confirmed') {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (statusLower === 'processing' || statusLower === 'shipped') {
      return 'bg-blue-100 text-blue-700';
    }
    if (statusLower === 'cancelled' || statusLower === 'failed' || statusLower === 'returned') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
