import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Order } from '../../../../core/models/order.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';
import { AdminOrdersResponse } from '../../../../core/models/admin.model';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  cancelled: [],
  returned: [],
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);

  orders = signal<Order[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  expandedOrderId = signal<string | null>(null);

  // Filters — plain properties for ngModel two-way binding
  orderStatusFilter = '';
  paymentStatusFilter = '';
  startDateFilter = '';
  endDateFilter = '';
  minTotalFilter = '';
  maxTotalFilter = '';
  currentPage = signal(1);

  orderStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];
  paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '10' };
    if (this.orderStatusFilter) params['orderStatus'] = this.orderStatusFilter;
    if (this.paymentStatusFilter) params['paymentStatus'] = this.paymentStatusFilter;
    if (this.startDateFilter) params['startDate'] = this.startDateFilter;
    if (this.endDateFilter) params['endDate'] = this.endDateFilter;
    if (this.minTotalFilter) params['minTotal'] = this.minTotalFilter;
    if (this.maxTotalFilter) params['maxTotal'] = this.maxTotalFilter;

    this.adminService.getAllOrders(params).subscribe({
      next: (res: AdminOrdersResponse) => {
        const rawOrders = res.orders || [];
        this.orders.set(rawOrders.filter((o) => !!o && !!o._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  clearFilters(): void {
    this.orderStatusFilter = '';
    this.paymentStatusFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.minTotalFilter = '';
    this.maxTotalFilter = '';
    this.currentPage.set(1);
    this.loadOrders();
  }

  getNextStatuses(currentStatus: string): OrderStatus[] {
    return STATUS_TRANSITIONS[currentStatus] ?? [];
  }

  updateStatus(order: Order, status: string): void {
    if (!status) return;
    this.actionLoading.set(order._id);
    this.adminService.updateOrderStatus(order._id, status).subscribe({
      next: (updatedOrder: Order) => {
        if (!updatedOrder || !updatedOrder._id) {
          this.actionLoading.set(null);
          this.loadOrders();
          return;
        }
        this.orders.update((list: Order[]) =>
          list.map((o) => (o && o._id === updatedOrder._id ? updatedOrder : o))
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  toggleExpand(orderId: string): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      delivered: 'status-success',
      paid: 'status-success',
      confirmed: 'status-info',
      processing: 'status-info',
      shipped: 'status-info',
      pending: 'status-warning',
      cancelled: 'status-danger',
      failed: 'status-danger',
      returned: 'status-danger',
    };
    return map[status?.toLowerCase()] ?? 'status-neutral';
  }
}
