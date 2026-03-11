import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../../core/services/admin.service';
import { Product } from '../../../../core/models/product.model';
import { AdminProductsResponse } from '../../../../core/models/admin.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);

  products = signal<Product[]>([]);
  categories = signal<{ _id: string; name: string }[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  searchQuery = signal('');
  categoryFilter = signal('');
  inStockFilter = signal('');
  currentPage = signal(1);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadProducts();
      });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) =>
        this.categories.set(
          res.categories.map((c: import('../../../../core/models/category.model').Category) => ({
            _id: c._id,
            name: c.name,
          }))
        ),
    });
  }

  loadProducts(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '12' };
    if (this.searchQuery()) params['search'] = this.searchQuery();
    if (this.categoryFilter()) params['category'] = this.categoryFilter();
    if (this.inStockFilter()) params['inStock'] = this.inStockFilter();

    this.adminService.getProducts(params).subscribe({
      next: (res: AdminProductsResponse) => {
        const rawProducts = res.products || [];
        this.products.set(rawProducts.filter((p) => !!p && !!p._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onCategoryChange(val: string): void {
    this.categoryFilter.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onInStockChange(val: string): void {
    this.inStockFilter.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  recoverProduct(product: Product): void {
    this.actionLoading.set(product._id + '-recover');
    this.adminService.recoverProduct(product._id).subscribe({
      next: (updatedProduct: Product) => {
        if (!updatedProduct || !updatedProduct._id) {
          this.actionLoading.set(null);
          this.loadProducts();
          return;
        }
        this.products.update((list) =>
          list.map((p) => (p && p._id === updatedProduct._id ? updatedProduct : p))
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  requestDelete(product: Product): void {
    this.confirmDeleteId.set(product._id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.actionLoading.set(id + '-delete');
    this.confirmDeleteId.set(null);
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p._id !== id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  get totalPages(): number {
    const p = this.pagination();
    if (!p) return 1;
    return p.totalPages ?? 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }

  isActionLoading(id: string, action: string): boolean {
    return this.actionLoading() === `${id}-${action}`;
  }
}
