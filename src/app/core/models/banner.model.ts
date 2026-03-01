// ─────────────────────────────────────────────────────────────────────────────
// banner.model.ts
//
// Covers: Homepage banners managed from the /admin/banners endpoint.
// Used by: AdminService (CRUD operations), HomepageComponent (carousel display).
// ─────────────────────────────────────────────────────────────────────────────

import { CloudinaryImage, Pagination } from './shared.model';

/**
 * A banner as returned by the backend.
 *
 * Banners are the hero images displayed in the homepage carousel.
 * Only banners where isActive === true should be shown to customers.
 * Admins can create many banners but selectively activate only some.
 */
export interface Banner {
  _id: string;

  title: string;

  // The URL the user navigates to when they click the banner.
  // Usually a category or product listing page, e.g. "/products?category=sale"
  link: string;

  image: CloudinaryImage;

  // When false, the banner exists in the system but is not shown to customers.
  // The homepage carousel should filter by isActive === true.
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Data sent to POST /admin/banners.
 * The image file itself is appended to FormData in the service —
 * only text fields are typed here.
 */
export interface CreateBannerPayload {
  title: string;
  link: string;
}

/**
 * Data sent to PATCH /admin/banners/:bannerId.
 * All fields optional — can update any combination of fields.
 */
export interface UpdateBannerPayload {
  title?: string;
  link?: string;
  isActive?: boolean;
}

/**
 * Query parameters for GET /admin/banners.
 */
export interface BannerQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  // Filter banners by active status — "true" or "false" as strings
  // because HTTP query params are always strings
  isActive?: string;
  search?: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

export interface BannersResponse {
  message: string;
  banners: Banner[];
  pagination?: Pagination;
}

export interface BannerResponse {
  message: string;
  banner: Banner;
}
