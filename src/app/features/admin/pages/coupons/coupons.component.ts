import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Coupon } from '../../../../core/models/admin.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';
import { AdminCouponsResponse } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminCouponsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  coupons = signal<Coupon[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  isSaving = signal(false);
  actionLoading = signal<string | null>(null);
  confirmDeactivateId = signal<string | null>(null);
  currentPage = signal(1);

  showModal = signal(false);
  editingCoupon = signal<Coupon | null>(null);

  couponForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCoupons();
  }

  initForm(coupon?: Coupon): void {
    this.couponForm = this.fb.group({
      code: [coupon?.code ?? '', [Validators.required, Validators.minLength(3)]],
      discountType: [coupon?.discountType ?? 'percentage', Validators.required],
      discountValue: [coupon?.discountValue ?? null, [Validators.required, Validators.min(1)]],
      minOrderAmount: [coupon?.minOrderAmount ?? null],
      maxUses: [coupon?.maxUses ?? null],
      expiresAt: [coupon?.expiresAt ? coupon.expiresAt.substring(0, 10) : ''],
    });
  }

  loadCoupons(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params = { page: String(this.currentPage()), limit: '10' };

    this.adminService.getCoupons(params).subscribe({
      next: (res: AdminCouponsResponse) => {
        const rawCoupons = res.coupons || [];
        this.coupons.set(rawCoupons.filter((c) => !!c && !!c._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load coupons. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingCoupon.set(null);
    this.initForm();
    this.showModal.set(true);
  }

  openEditModal(coupon: Coupon): void {
    this.editingCoupon.set(coupon);
    this.initForm(coupon);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCoupon.set(null);
  }

  saveCoupon(): void {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const data = { ...this.couponForm.value };
    if (!data.expiresAt) delete data.expiresAt;
    if (!data.minOrderAmount) delete data.minOrderAmount;
    if (!data.maxUses) delete data.maxUses;

    const editing = this.editingCoupon();
    const req = editing
      ? this.adminService.updateCoupon(editing._id, data)
      : this.adminService.createCoupon(data);

    req.subscribe({
      next: (updatedCoupon: Coupon) => {
        if (!updatedCoupon || !updatedCoupon._id) {
          this.isSaving.set(false);
          this.loadCoupons(); // fallback
          return;
        }

        if (editing) {
          this.coupons.update((list: Coupon[]) =>
            list.map((c) => (c && c._id === updatedCoupon._id ? updatedCoupon : c))
          );
        } else {
          this.coupons.update((list: Coupon[]) => [updatedCoupon, ...list]);
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => this.isSaving.set(false),
    });
  }

  requestDeactivate(coupon: Coupon): void {
    this.confirmDeactivateId.set(coupon._id);
  }

  cancelDeactivate(): void {
    this.confirmDeactivateId.set(null);
  }

  confirmDeactivate(): void {
    const id = this.confirmDeactivateId();
    if (!id) return;
    this.actionLoading.set(id);
    this.confirmDeactivateId.set(null);
    this.adminService.deactivateCoupon(id).subscribe({
      next: () => {
        this.coupons.update((list: Coupon[]) => list.filter((c) => c._id !== id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.couponForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCoupons();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
