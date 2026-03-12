import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminReview, AdminReviewsResponse } from '../../../../core/models/admin.model';
import { Pagination } from '../../../../core/models/shared.model';
import { listAnimation, fadeInOut } from '../../../../core/animations/admin.animations';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css',
  animations: [listAnimation, fadeInOut],
})
export class AdminReviewsComponent implements OnInit {
  private adminService = inject(AdminService);

  reviews = signal<AdminReview[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isInitialLoad = signal(true);
  isFiltering = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  productFilter = signal('');
  ratingFilter = signal('');
  currentPage = signal(1);

  private productSearchSubject = new Subject<string>();

  stars = [1, 2, 3, 4, 5];

  constructor() {
    this.productSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => {
        this.productFilter.set(q);
        this.currentPage.set(1);
        this.loadReviews();
      });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    if (this.isInitialLoad()) {
      this.isLoading.set(true);
    } else {
      this.isFiltering.set(true);
    }
    this.error.set(null);
    const params: Record<string, string> = { page: String(this.currentPage()), limit: '10' };
    if (this.productFilter()) params['productId'] = this.productFilter();
    if (this.ratingFilter()) params['rating'] = this.ratingFilter();

    this.adminService.getReviews(params).subscribe({
      next: (res: AdminReviewsResponse) => {
        const rawReviews = res.reviews || [];
        this.reviews.set(rawReviews.filter((r) => !!r && !!r._id));
        this.pagination.set(res.pagination ?? null);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
      error: () => {
        this.error.set('Failed to load reviews. Please try again.');
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
        this.isFiltering.set(false);
      },
    });
  }

  onProductSearch(event: Event): void {
    this.productSearchSubject.next((event.target as HTMLInputElement).value);
  }

  onRatingChange(val: string): void {
    this.ratingFilter.set(val);
    this.currentPage.set(1);
    this.loadReviews();
  }

  requestDelete(review: AdminReview): void {
    this.confirmDeleteId.set(review._id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.actionLoading.set(id);
    this.confirmDeleteId.set(null);
    this.adminService.deleteReview(id).subscribe({
      next: () => {
        this.reviews.update((list) => list.filter((r) => r._id !== id));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
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

  getReviewerName(userId: unknown): string {
    if (typeof userId === 'object' && userId !== null && 'userName' in userId) {
      return (userId as { userName: string }).userName;
    }
    return 'Unknown';
  }

  getProductName(productId: unknown): string {
    if (typeof productId === 'object' && productId !== null && 'name' in productId) {
      return (productId as { name: string }).name;
    }
    return 'Unknown Product';
  }

  getStarArray(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
