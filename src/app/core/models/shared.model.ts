// ─────────────────────────────────────────────────────────────────────────────
// shared.model.ts
//
// Purpose: Contains small, reusable types that appear in MULTIPLE models.
// Instead of copy-pasting the same interface in every file, we define it here
// once and import it wherever needed.
//
// Rule: If a type is only used in ONE domain, define it in that domain's model
// file. If it appears in two or more, it belongs here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every image stored in this project goes through Cloudinary.
 * Cloudinary returns two pieces of information for every uploaded file:
 *   - secure_url: the full HTTPS URL you put in an <img src="..."> tag
 *   - public_id:  Cloudinary's internal identifier, used when you want to
 *                 delete or transform the image later
 *
 * This interface is used by Product (mainImage, subImages),
 * Category (image), Banner (image), and Seller (storeImage).
 */
export interface CloudinaryImage {
  secure_url: string;
  public_id: string;
}

/**
 * The standard pagination object returned by any list endpoint that
 * supports paging (GET /product, GET /order, etc.).
 * Using a shared interface ensures every component that reads pagination
 * uses the same field names — no guessing whether it's "totalPage" or
 * "totalPages" or "pageCount".
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * The simplest possible API response — just a message.
 * Used for DELETE, PATCH status-only endpoints where the backend
 * confirms the action succeeded but returns no data object.
 * Example: DELETE /product/:id → { "message": "Product deleted successfully" }
 */
export interface MessageResponse {
  message: string;
}

/**
 * Query parameters that almost every list endpoint accepts.
 * Defined here so service methods can accept a typed params object
 * instead of a loose Record<string, string>.
 *
 * All fields are optional because the backend applies defaults
 * (page=1, limit=10) when they are not provided.
 */
export interface PaginationParams {
  page?: string;
  limit?: string;
}
