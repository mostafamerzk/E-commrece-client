import {
  Component,
  input,
  signal,
  inject,
  computed,
  effect,
  OnInit,
  HostListener,
} from '@angular/core';
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
import { Review, AddReviewPayload } from '../../../core/models/review.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ToastService } from '../../../core/services/toast.service';
import { finalize, timeout, tap } from 'rxjs';
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
export class ReviewsSectionComponent implements OnInit {
  // Inputs passed from parent
  productId = input.required<string>();
  initialAvgRating = input.required<number>();
  initialReviews = input.required<Review[]>();

  public reviewService = inject(ReviewService);
  public authService = inject(AuthService);
  public toast = inject(ToastService);

  // Internal reactive state
  reviews = signal<Review[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  status = signal<string | null>(null);

  // Custom Rating Logic
  hoveredRating = signal(0);

  // Custom Confirmation Modal Logic
  showDeleteModal = signal(false);
  reviewToDelete = signal<string | null>(null);

  // Options Menu & Edit Logic
  openMenuId = signal<string | null>(null);
  editingReviewId = signal<string | null>(null);
  isUpdating = signal(false);

  editForm = new FormGroup({
    rating: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  avgRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return this.initialAvgRating();
    return r.reduce((s, v) => s + v.rating, 0) / r.length;
  });

  ratingDistribution = computed(() => {
    const r = this.reviews();
    const dist = [0, 0, 0, 0, 0]; // Index 0=5*, 1=4*, 2=3*, 3=2*, 4=1*
    if (!r || r.length === 0) return dist.map((count) => ({ count, percentage: 0 }));

    r.forEach((review) => {
      // Ensure rating is treated as a number
      const rating = Number(review.rating);
      const index = 5 - Math.round(rating);
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
    // Load fresh data whenever productId changes
    effect(
      () => {
        const id = this.productId();
        if (id && this.reviews().length === 0) {
          console.log('[ReviewsSection] Product ID changed, loading reviews:', id);
          this.loadReviews();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // Sync from parent initially
    this.reviews.set(this.initialReviews());
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
    if (!id) return;

    this.isLoading.set(true);
    this.reviewService
      .getProductReviews(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          console.log('[ReviewsSection] Received reviews:', res.reviews?.length || 0);
          if (res.reviews?.length > 0) {
            console.log('[ReviewsSection] First review structure:', res.reviews[0]);
          }
          this.reviews.set(res.reviews || []);
        },
        error: (err) => {
          console.error('[ReviewsSection] Error loading reviews:', err);
          this.toast.error('Failed to load reviews');
        },
      });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) return;

    this.status.set(null);
    this.isSubmitting.set(true);
    const payload: AddReviewPayload = {
      rating: this.reviewForm.value.rating!,
      comment: this.reviewForm.value.comment!,
    };

    const productId = this.productId();
    console.log(`[ReviewsSection] 📤 REQUEST - Submitting review for productId: ${productId}`);
    console.log('[ReviewsSection] 📤 PAYLOAD:', payload);

    this.reviewService
      .addReview(productId, payload)
      .pipe(
        tap((res) => {
          console.log('[ReviewsSection] 📥 RESPONSE - Success:', res);
          console.log('[ReviewsSection] 📥 RESPONSE - Full object:', JSON.stringify(res, null, 2));
        }),
        timeout(10000), // 10 second timeout
        finalize(() => {
          console.log('[ReviewsSection] ✅ Request completed');
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          console.log('[ReviewsSection] 🎉 Review posted successfully:', res);
          this.toast.success('Review submitted successfully');
          this.reviewForm.reset();
          this.loadReviews();
        },
        error: (err) => {
          console.error('[ReviewsSection] ❌ Review submission error:', err);
          console.error('[ReviewsSection] ❌ Error status:', err.status);
          console.error('[ReviewsSection] ❌ Error message:', err.message);
          console.error('[ReviewsSection] ❌ Full error:', JSON.stringify(err, null, 2));

          if (err.status === 400) {
            const msg = 'You have already submitted a review for this product';
            this.status.set(msg);
            this.toast.error(msg);
            return;
          }

          // Extract the specific error message from the API response
          let errorMsg = 'Failed to submit review';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error.message) {
              errorMsg = err.error.message;
            }
          } else if (err.message) {
            errorMsg = err.message;
          }

          this.status.set(errorMsg);
          this.toast.error(errorMsg);
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
    const review = this.reviews().find((r) => r._id === reviewId);
    if (review && !this.canDelete(review)) {
      this.toast.error('You are not authorized to delete this review');
      return;
    }

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
    const userId = review.userId || review.user?._id;
    return !!user && userId === user._id;
  }

  canEdit(review: Review): boolean {
    const user = this.currentUser();
    const userId = review.userId || review.user?._id;
    return !!user && userId === user._id;
  }

  toggleMenu(reviewId: string, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId() === reviewId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(reviewId);
    }
  }

  startEdit(review: Review): void {
    this.editingReviewId.set(review._id);
    this.editForm.patchValue({
      rating: review.rating,
      comment: review.comment || '',
    });
    this.openMenuId.set(null);
  }

  cancelEdit(): void {
    this.editingReviewId.set(null);
    this.editForm.reset();
  }

  handleEditKeyup(event: KeyboardEvent, reviewId: string): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEdit(reviewId);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  saveEdit(reviewId: string): void {
    if (this.editForm.invalid) return;

    this.isUpdating.set(true);
    const payload = {
      rating: this.editForm.value.rating!,
      comment: this.editForm.value.comment!,
    };

    const review = this.reviews().find((r) => r._id === reviewId);
    if (review && !this.canEdit(review)) {
      this.toast.error('You are not authorized to edit this review');
      return;
    }

    this.reviewService
      .updateReview(reviewId, payload)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.success('Review updated');
          // Update local state
          this.reviews.update((prev) =>
            prev.map((r) => (r._id === reviewId ? { ...r, ...res.review } : r))
          );
          this.cancelEdit();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to update review');
        },
      });
  }

  // Host listener to close menus when clicking outside
  @HostListener('document:click')
  closeAllMenus(): void {
    this.openMenuId.set(null);
  }
}
