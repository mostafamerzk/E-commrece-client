// ─────────────────────────────────────────────────────────────────────────────
// admin.model.ts — All admin-specific models, query params, and responses.
// ─────────────────────────────────────────────────────────────────────────────

import { Pagination } from './shared.model';
import { Product } from './product.model';
import type { Order, OrderStatus, ShippingAddress } from './order.model';
export type { Order, OrderStatus, ShippingAddress };
import { Banner } from './banner.model';

// ─── Admin User Model ─────────────────────────────────────────────────────────
// The admin /users endpoint returns extra fields not in the base User model.

export interface AdminUser {
  _id: string;
  userName: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  isBlocked?: boolean;
  isDeleted?: boolean;
  profileImage?: { secure_url: string; public_id: string };
  phone?: string;
  addresses?: ShippingAddress[];
  createdAt?: string;
}

export interface AdminUserQueryParams {
  [key: string]: string | undefined;
  search?: string;
  page?: string;
  limit?: string;
  role?: string;
  isBlocked?: string;
}

export interface AdminSellerQueryParams {
  [key: string]: string | undefined;
  search?: string;
  page?: string;
  limit?: string;
  isBlocked?: string;
}

export interface AdminProductQueryParams {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
  sort?: 'newest' | 'oldest' | 'priceHigh' | 'priceLow' | 'rating';
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  search?: string;
}

export interface AdminOrderQueryParams {
  [key: string]: string | OrderStatus | undefined;
  page?: string;
  limit?: string;
  sort?: 'newest' | 'oldest' | 'totalHigh' | 'totalLow' | 'status';
  orderStatus?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'card' | 'cash';
  userId?: string;
  minTotal?: string;
  maxTotal?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminCouponQueryParams {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
}

export interface AdminReviewQueryParams {
  [key: string]: string | undefined;
  productId?: string;
  userId?: string;
  rating?: string;
  page?: string;
  limit?: string;
}

export interface AdminBannerQueryParams {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
  sort?: 'newest' | 'oldest' | 'title';
  isActive?: string;
  search?: string;
}

// ─── Seller Model (admin view) ────────────────────────────────────────────────
// SellerProfile for admin is a leaner shape returned by the /admin/sellers endpoint.

export interface AdminSellerInfo {
  _id: string;
  userId: string;
  storeName: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  productsCount?: number;
  createdAt: string;
}

export interface SellerDetail extends AdminSellerInfo {
  products: Product[];
}

// ─── Coupon Model ─────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}

// ─── Review Model ─────────────────────────────────────────────────────────────

export interface AdminReview {
  _id: string;
  userId: { _id: string; userName: string; email: string } | string;
  productId: { _id: string; name: string } | string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ─── Banner Model ─────────────────────────────────────────────────────────────
// Banner is defined in banner.model.ts — imported above, re-exported for admin use.
// (No duplicate definition here to avoid TS2308 from the barrel index.ts)

// ─── Analytics Models ─────────────────────────────────────────────────────────

export interface DayRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  category?: string;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface AnalyticsResponse {
  message: string;
  data: {
    counts: {
      totalUsers: number;
      totalSellers: number;
      totalProducts: number;
      totalOrders: number;
    };
    revenue: {
      totalRevenue: { _id: null; total: number }[];
      byDay: { _id: string; total: number }[];
      byMonth: { _id: string; total: number }[];
    };
    ordersByStatus: { _id: string; count: number }[];
    topProducts: { _id: string; title: string; soldQuantity: number }[];
    lowStock: Product[];
  };
}

// ─── Paginated Response Generic ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  docs?: T[];
  pagination?: Pagination;
  // Some endpoints use specific keys
  users?: T[];
  sellers?: T[];
  products?: T[];
  orders?: T[];
  coupons?: T[];
  reviews?: T[];
  banners?: T[];
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

export interface AdminUsersResponse {
  message: string;
  users: AdminUser[];
  docs?: AdminUser[];
  pagination?: Pagination;
}

export interface AdminSellersResponse {
  message: string;
  sellers: AdminSellerInfo[];
  docs?: AdminSellerInfo[];
  pagination?: Pagination;
}

export interface AdminProductsResponse {
  message: string;
  products: Product[];
  docs?: Product[];
  pagination?: Pagination;
}

export interface AdminOrdersResponse {
  message: string;
  orders: Order[];
  docs?: Order[];
  pagination?: Pagination;
}

export interface AdminCouponsResponse {
  message: string;
  coupons: Coupon[];
  docs?: Coupon[];
  pagination?: Pagination;
}

export interface AdminReviewsResponse {
  message: string;
  reviews: AdminReview[];
  docs?: AdminReview[];
  pagination?: Pagination;
}

export interface AdminBannersResponse {
  message: string;
  banners: Banner[];
  docs?: Banner[];
  pagination?: Pagination;
}

export interface AdminUserResponse {
  message: string;
  user: AdminUser;
}

export interface AdminSellerResponse {
  message: string;
  seller: AdminSellerInfo;
}

export interface AdminOrderResponse {
  message: string;
  order: Order;
}

// ─── KPI / Stats (legacy for existing dashboard) ─────────────────────────────

export interface AdminStat {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  route: string;
  colorScheme?: string;
  change?: number;
}

export interface AdminStatsResponse {
  message: string;
  stats: AdminStat[];
}
