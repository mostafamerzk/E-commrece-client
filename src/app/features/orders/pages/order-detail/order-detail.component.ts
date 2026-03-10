import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderItem,
} from '../../../../core/models/order.model';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe, SkeletonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);
  readonly isCancelling = signal(false);

  readonly steps = [
    { status: 'pending', label: 'Pending', icon: 'pi pi-shopping-cart' },
    { status: 'confirmed', label: 'Confirmed', icon: 'pi pi-check-circle' },
    { status: 'processing', label: 'Processing', icon: 'pi pi-cog' },
    { status: 'shipped', label: 'Shipped', icon: 'pi pi-truck' },
    { status: 'delivered', label: 'Delivered', icon: 'pi pi-home' },
  ];

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.fetchOrderDetails(id);
      }
    });
  }

  fetchOrderDetails(id: string) {
    this.isLoading.set(true);
    this.orderService.getById(id).subscribe({
      next: (res: unknown) => {
        console.log('[OrderDetail] Raw Response:', res);

        const r = res as Record<string, unknown>;
        // Match backend structure: { message: "...", order: { ... } }
        // We also check 'data' or the root as fallbacks just in case
        const orderData = r['order'] || r['data'] || (r['_id'] ? r : null);

        if (orderData) {
          this.order.set(orderData as Order);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.isLoading.set(false);
      },
    });
  }

  canCancel(status: OrderStatus): boolean {
    return status === 'pending' || status === 'confirmed';
  }

  confirmCancelOrder() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this order?',
      header: 'Cancel Order Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.cancelOrder();
      },
    });
  }

  cancelOrder() {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.isCancelling.set(true);
    this.orderService.cancelOrder(currentOrder._id).subscribe({
      next: () => {
        this.toastService.success('Order cancelled successfully');
        this.fetchOrderDetails(currentOrder._id);
        this.isCancelling.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to cancel order');
        this.isCancelling.set(false);
      },
    });
  }

  calculateSubtotal(): number {
    return (
      this.order()?.products.reduce(
        (sum: number, item: OrderItem) => sum + item.unitPrice * item.quantity,
        0
      ) || 0
    );
  }

  isCancelledOrReturned(status: OrderStatus): boolean {
    return status === 'cancelled' || status === 'returned';
  }

  getStatusDotClass(status: OrderStatus): string {
    return `dot-${status}`;
  }

  getStatusTextClass(status: OrderStatus): string {
    return `text-${status}`;
  }

  getStepperProgress(): string {
    const status = this.order()?.orderStatus;
    const index = this.steps.findIndex((s) => s.status === status);
    if (index === -1) return '0%';
    return (index / (this.steps.length - 1)) * 100 + '%';
  }

  getStepCircleClass(status: string): string {
    const orderStatus = this.order()?.orderStatus;
    const currentIdx = this.steps.findIndex((s) => s.status === orderStatus);
    const stepIdx = this.steps.findIndex((s) => s.status === status);

    if (stepIdx < currentIdx) {
      return 'is-complete';
    } else if (stepIdx === currentIdx) {
      return 'is-active';
    }
    return 'is-pending';
  }

  getStepTextClass(status: string): string {
    const orderStatus = this.order()?.orderStatus;
    const currentIdx = this.steps.findIndex((s) => s.status === orderStatus);
    const stepIdx = this.steps.findIndex((s) => s.status === status);

    if (stepIdx <= currentIdx) {
      return 'is-labeled';
    }
    return '';
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

  getPaymentStatusClasses(status: PaymentStatus): string {
    return `payment-${status}`;
  }
}
