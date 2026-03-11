import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  AddReviewPayload,
  ReviewResponse,
  ReviewsResponse,
  UpdateReviewPayload,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiService = inject(ApiService);

  /**
   * Add a review to a product.
   * POST /review/:productId
   */
  addReview(productId: string, payload: AddReviewPayload): Observable<ReviewResponse> {
    const endpoint = `${API_ENDPOINTS.REVIEWS}/${productId}`;
    console.log('[ReviewService] 📤 POST endpoint:', endpoint);
    console.log('[ReviewService] 📤 Payload:', payload);
    return this.apiService.post<ReviewResponse, AddReviewPayload>(endpoint, payload);
  }

  /**
   * Get all reviews for a product (paginated).
   * GET /review/:productId
   */
  getProductReviews(
    productId: string,
    params?: Record<string, unknown>
  ): Observable<ReviewsResponse> {
    return this.apiService.get<ReviewsResponse>(`${API_ENDPOINTS.REVIEWS}/${productId}`, params);
  }

  /**
   * Update an existing review.
   * PATCH /review/:reviewId
   */
  updateReview(reviewId: string, payload: UpdateReviewPayload): Observable<ReviewResponse> {
    return this.apiService.patch<ReviewResponse, UpdateReviewPayload>(
      `${API_ENDPOINTS.REVIEWS}/${reviewId}`,
      payload
    );
  }

  /**
   * Delete an existing review.
   * DELETE /review/:reviewId
   */
  deleteReview(reviewId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
  }
}
