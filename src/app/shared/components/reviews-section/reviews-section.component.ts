import { Component, input, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe, DecimalPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Review, AddReviewPayload } from '../../../core/models/review.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RatingModule,
    ButtonModule,
    TextareaModule,
    SkeletonModule,
    ConfirmDialogModule,
    DatePipe,
    SlicePipe,
    DecimalPipe,
    EmptyStateComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './reviews-section.component.html',
})
export class ReviewsSectionComponent implements OnInit {
  productId = input.required<string>();

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  reviews = signal<Review[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

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

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.reviewService
      .getProductReviews(this.productId())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.reviews.set(res.reviews);
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
          // Add the new review to the list (backend usually returns the full review object)
          this.reviews.update((prev) => [res.review, ...prev]);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to submit review');
        },
      });
  }

  confirmDelete(reviewId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this review?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteReview(reviewId),
    });
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
