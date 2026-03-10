import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../core/models/order.model';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, SkeletonModule, PaginatorModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalOrders = signal(0);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading.set(true);
    this.orderService
      .getUserOrders({
        page: this.currentPage(),
        limit: this.pageSize(),
      })
      .subscribe({
        next: (res: unknown) => {
          console.log('[OrderList] Raw Response:', res);

          let ordersArray: Order[] = [];
          let total = 0;

          if (Array.isArray(res)) {
            ordersArray = res as Order[];
            total = ordersArray.length;
          } else if (res && typeof res === 'object') {
            const r = res as Record<string, unknown>;

            // Handle mongoose-paginate-v2 structure: { orders: { docs: [], totalDocs: ... } }
            const ordersContainer = r['orders'] as Record<string, unknown> | undefined;
            if (ordersContainer && Array.isArray(ordersContainer['docs'])) {
              ordersArray = ordersContainer['docs'] as Order[];
              total = (ordersContainer['totalDocs'] as number) || ordersArray.length;
            }
            // Handle standard structure: { orders: [] }
            else if (Array.isArray(r['orders'])) {
              ordersArray = r['orders'] as Order[];
              const pagination = r['pagination'] as Record<string, unknown> | undefined;
              total = (pagination?.['totalItems'] as number) || ordersArray.length;
            }
            // Handle data envelope: { data: { orders: { docs: [] } } }
            else if (r['data']) {
              const data = r['data'] as Record<string, unknown>;
              const dataOrders = data['orders'] as Record<string, unknown> | Order[] | undefined;

              if (
                dataOrders &&
                typeof dataOrders === 'object' &&
                !Array.isArray(dataOrders) &&
                'docs' in dataOrders
              ) {
                const container = dataOrders as Record<string, unknown>;
                if (Array.isArray(container['docs'])) {
                  ordersArray = container['docs'] as Order[];
                  total = (container['totalDocs'] as number) || ordersArray.length;
                }
              } else if (Array.isArray(data['orders'])) {
                ordersArray = data['orders'] as Order[];
                const pagination = data['pagination'] as Record<string, unknown> | undefined;
                total = (pagination?.['totalItems'] as number) || ordersArray.length;
              } else if (Array.isArray(data)) {
                ordersArray = data as Order[];
                const pagination = r['pagination'] as Record<string, unknown> | undefined;
                total = (pagination?.['totalItems'] as number) || ordersArray.length;
              }
            }
          }

          this.orders.set(ordersArray);
          this.totalOrders.set(total);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load orders');
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PaginatorState) {
    if (event.page !== undefined) {
      this.currentPage.set(event.page + 1);
      this.fetchOrders();
    }
  }

  getStatusColor(status: OrderStatus): string {
    return `status-${status}`;
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    return `payment-${status}`;
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const icons: Record<PaymentMethod, string> = {
      creditCard: 'pi pi-credit-card',
      cod: 'pi pi-wallet',
      paypal: 'pi pi-paypal',
      wallet: 'pi pi-briefcase',
    };
    return icons[method] || 'pi pi-money-bill';
  }

  formatPaymentMethod(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      creditCard: 'Credit Card',
      cod: 'Cash on Delivery',
      paypal: 'PayPal',
      wallet: 'Wallet',
    };
    return labels[method] || method;
  }
}
