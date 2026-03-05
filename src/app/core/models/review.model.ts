// ─────────────────────────────────────────────────────────────────────────────
// review.model.ts
//
// Covers: Product reviews from the /review endpoint.
// Used by: ReviewService, ReviewsSectionComponent, ProductDetailComponent
//          (product.reviews is typed using this), AdminService (delete review).
//
// NOTE: review.model.ts is imported by product.model.ts (for the reviews array
// on a single product). This means product.model.ts depends on review.model.ts.
// Import order matters — review.model.ts must be processed first.
// ─────────────────────────────────────────────────────────────────────────────

import { Pagination } from './shared.model';

/**
 * A single product review as returned by the backend.
 *
 * The parentComment field is interesting — it suggests the backend
 * supports threaded comments (replies to reviews). The UI can use this
 * to nest replies under the review they belong to.
 */
export interface Review {
  _id: string;

  // The MongoDB ObjectId of the user who wrote this review.
  userId: string;

  // Populated user information for display.
  user: {
    _id: string;
    userName: string;
  };

  productId: string;

  // Rating is constrained to 1–5 stars (enforced by the backend).
  rating: 1 | 2 | 3 | 4 | 5;

  // Optional because the API contract marks comment as optional
  comment?: string;

  // Optional: present only if this review is a reply to another review.
  parentComment?: string;

  createdAt: string;
  updatedAt?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body sent to POST /review/:productId.
 * The productId comes from the URL param, not the body.
 */
export interface AddReviewPayload {
  // number instead of the literal union type because the form's value
  // will be a plain number — TypeScript will validate it fits the range
  rating: number;
  comment?: string;
}

/**
 * Body sent to PATCH /review/:reviewId.
 * Both fields optional — user can update just rating, just comment, or both.
 */
export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

/**
 * Response from GET /review/:productId — the paginated review list.
 */
export interface ReviewsResponse {
  message: string;
  reviews: Review[];
  pagination?: Pagination;
}

/**
 * Response from POST /review/:productId and PATCH /review/:reviewId.
 */
export interface ReviewResponse {
  message: string;
  review: Review;
}
