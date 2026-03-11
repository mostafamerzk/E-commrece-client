import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminSellerInfo, AdminSellersResponse } from '../../../../core/models/admin.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';

@Component({
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sellers.component.html',
  styleUrl: './sellers.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminSellersComponent implements OnInit {
  private adminService = inject(AdminService);

  sellers = signal<AdminSellerInfo[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);

  searchQuery = signal('');
  blockedFilter = signal('');
  currentPage = signal(1);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.searchQuery.set(q);
        this.currentPage.set(1);
        this.loadSellers();
      });
  }

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '10' };
    if (this.searchQuery()) params['search'] = this.searchQuery();
    if (this.blockedFilter()) params['isBlocked'] = this.blockedFilter();

    this.adminService.getSellers(params).subscribe({
      next: (res: AdminSellersResponse) => {
        const rawSellers = res.sellers || [];
        this.sellers.set(rawSellers.filter((s) => !!s && !!s._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load sellers. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onBlockedChange(val: string): void {
    this.blockedFilter.set(val);
    this.currentPage.set(1);
    this.loadSellers();
  }

  approveSeller(seller: AdminSellerInfo): void {
    this.actionLoading.set(seller._id + '-approve');
    this.adminService.approveSeller(seller._id).subscribe({
      next: (updatedSeller: AdminSellerInfo) => {
        if (!updatedSeller || !updatedSeller._id) {
          this.actionLoading.set(null);
          this.loadSellers();
          return;
        }
        this.sellers.update((list: AdminSellerInfo[]) =>
          list.map((s) => (s && s._id === updatedSeller._id ? updatedSeller : s))
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  restrictSeller(seller: AdminSellerInfo): void {
    this.actionLoading.set(seller._id + '-restrict');
    this.adminService.restrictSeller(seller._id).subscribe({
      next: (updatedSeller: AdminSellerInfo) => {
        if (!updatedSeller || !updatedSeller._id) {
          this.actionLoading.set(null);
          this.loadSellers();
          return;
        }
        this.sellers.update((list: AdminSellerInfo[]) =>
          list.map((s) => (s && s._id === updatedSeller._id ? updatedSeller : s))
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadSellers();
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

  isActionLoading(id: string, action: string): boolean {
    return this.actionLoading() === `${id}-${action}`;
  }
}
