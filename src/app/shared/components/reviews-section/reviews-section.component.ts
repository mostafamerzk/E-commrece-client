import { Component, input, signal, inject, computed, effect } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Review, AddReviewPayload, ReviewsResponse } from '../../../core/models/review.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';
import { PrimaryButton } from '../primary-button/primary-button';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    DatePipe,
    RouterLink,
    PrimaryButton,
    EmptyStateComponent,
  ],
  templateUrl: './reviews-section.component.html',
  styleUrl: './reviews-section.component.css',
})
export class ReviewsSectionComponent {
  productId = input<string>('test-product-id');
  initialReviews = input<Review[]>([]);

  public reviewService = inject(ReviewService);
  public authService = inject(AuthService);
  public toast = inject(ToastService);

  reviews = signal<Review[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  // Custom Rating Logic
  hoveredRating = signal(0);

  // Custom Confirmation Modal Logic
  showDeleteModal = signal(false);
  reviewToDelete = signal<string | null>(null);

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  avgRating = computed(() => {
    const r = this.reviews();
    return r.length ? r.reduce((s, v) => s + v.rating, 0) / r.length : 0;
  });

  ratingDistribution = computed(() => {
    const r = this.reviews();
    const dist = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1
    if (!r.length) return dist.map((count) => ({ count, percentage: 0 }));

    r.forEach((review) => {
      const index = 5 - Math.round(review.rating);
      if (index >= 0 && index < 5) dist[index]++;
    });

    return dist.map((count) => ({
      count,
      percentage: (count / r.length) * 100,
    }));
  });

  reviewForm = new FormGroup({
    rating: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  constructor() {
    effect(() => {
      const id = this.productId();
      const initial = this.initialReviews();

      // If we have initial reviews and the productId matches, use them immediately
      if (initial.length > 0) {
        this.reviews.set(initial);
      }

      // Always try to fetch fresh reviews if we have a valid ID
      if (id && id !== 'test-product-id') {
        this.loadReviews();
      }
    });
  }

  // --- Validation Helpers ---
  get isRatingInvalid(): boolean {
    const ctrl = this.reviewForm.get('rating');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get isCommentInvalid(): boolean {
    const ctrl = this.reviewForm.get('comment');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get commentError(): string {
    const errors = this.reviewForm.get('comment')?.errors;
    if (errors?.['required']) return 'Please share your feedback';
    if (errors?.['minlength']) return 'Minimum 10 characters required';
    return '';
  }

  // --- Star Logic Helpers ---
  getStarFill(star: number, rating: number): 'currentColor' | 'url(#half-gradient)' | 'none' {
    if (rating >= star) return 'currentColor';
    if (rating >= star - 0.5) return 'url(#half-gradient)';
    return 'none';
  }

  isPickerStarActive(star: number): boolean {
    const currentRating = this.hoveredRating() || this.reviewForm.value.rating || 0;
    return currentRating >= star;
  }

  loadReviews(): void {
    const id = this.productId();
    if (!id || id === 'test-product-id') return;

    this.isLoading.set(true);
    this.reviewService
      .getProductReviews(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: ReviewsResponse) => {
          const extractArray = (data: unknown): Review[] => {
            if (Array.isArray(data)) return data as Review[];
            if (!data || typeof data !== 'object') return [];

            const d = data as Record<string, unknown>;
            if (Array.isArray(d['docs'])) return d['docs'] as Review[];
            if (Array.isArray(d['reviews'])) return d['reviews'] as Review[];

            // Recursively check reviews/docs properties if they are objects (handles weird nesting)
            if (d['reviews'] && typeof d['reviews'] === 'object') {
              return extractArray(d['reviews']);
            }
            if (d['docs'] && typeof d['docs'] === 'object') {
              return extractArray(d['docs']);
            }
            return [];
          };

          const reviewArray = extractArray(res.reviews) || extractArray(res) || [];
          this.reviews.set(reviewArray);
        },
        error: () => {
          this.toast.error('Failed to load reviews');
        },
      });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) return;

    this.isSubmitting.set(true);
    const payload: AddReviewPayload = {
      rating: this.reviewForm.value.rating!,
      comment: this.reviewForm.value.comment!,
    };

    this.reviewService
      .addReview(this.productId(), payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.success('Review submitted successfully');
          this.reviewForm.reset();
          this.reviews.update((prev) => [res.review, ...prev]);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to submit review');
        },
      });
  }

  confirmDelete(reviewId: string): void {
    this.reviewToDelete.set(reviewId);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.reviewToDelete.set(null);
  }

  acceptDelete(): void {
    const id = this.reviewToDelete();
    if (id) {
      this.deleteReview(id);
    }
    this.cancelDelete();
  }

  private deleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toast.success('Review deleted');
        this.reviews.update((prev) => prev.filter((r) => r._id !== reviewId));
      },
      error: () => {
        this.toast.error('Failed to delete review');
      },
    });
  }

  canDelete(review: Review): boolean {
    const user = this.currentUser();
    return !!user && (review.userId === user._id || this.isAdmin());
  }
}
