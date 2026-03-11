import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AdminStatsResponse,
  AdminUsersResponse,
  AdminSellersResponse,
  AdminProductsResponse,
  AdminOrdersResponse,
  AdminCouponsResponse,
  AdminReviewsResponse,
  AdminBannersResponse,
  AdminUser,
  AdminReview,
  Coupon,
  AdminUserQueryParams,
  AdminSellerQueryParams,
  AdminProductQueryParams,
  AdminOrderQueryParams,
  AdminCouponQueryParams,
  AdminReviewQueryParams,
  AdminBannerQueryParams,
  AnalyticsResponse,
  Coupon,
  SellerDetail,
  AdminSellerInfo,
  CreateCouponPayload,
  UpdateCouponPayload,
  Order,
} from '../models/admin.model';
import { Banner } from '../models/banner.model';
import { Pagination } from '../models/shared.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);
  private baseUrl = environment.apiUrl;

  // ─── Analytics ────────────────────────────────────────────────────────────────

  getAnalytics(params?: Record<string, unknown>): Observable<AnalyticsResponse> {
    return this.api.get<AnalyticsResponse>(API_ENDPOINTS.ADMIN.ANALYTICS, params);
  }

  getStats(params?: Record<string, unknown>): Observable<AdminStatsResponse> {
    return this.getAnalytics(params).pipe(
      map((res: AnalyticsResponse) => {
        const counts = res.data.counts;
        return {
          message: res.message,
          stats: [
            {
              label: 'Total Users',
              value: counts.totalUsers || 0,
              icon: 'pi pi-users',
              iconBg: 'var(--color-primary-50)',
              iconColor: 'var(--color-primary-600)',
              route: '/admin/users',
              colorScheme: 'blue',
            },
            {
              label: 'Total Sellers',
              value: counts.totalSellers || 0,
              icon: 'pi pi-shopping-bag',
              iconBg: 'var(--color-secondary-50)',
              iconColor: 'var(--color-secondary-600)',
              route: '/admin/sellers',
              colorScheme: 'purple',
            },
            {
              label: 'Total Products',
              value: counts.totalProducts || 0,
              icon: 'pi pi-box',
              iconBg: 'var(--color-warning-50)',
              iconColor: 'var(--color-warning-600)',
              route: '/admin/products',
              colorScheme: 'orange',
            },
            {
              label: 'Total Orders',
              value: counts.totalOrders || 0,
              icon: 'pi pi-shopping-cart',
              iconBg: 'var(--color-success-50)',
              iconColor: 'var(--color-success-600)',
              route: '/admin/orders',
              colorScheme: 'green',
            },
          ],
        };
      }),
      catchError((err) => {
        console.error('Error fetching admin stats:', err);
        return of({ message: 'Error', stats: [] });
      })
    );
  }

  // ─── Users ────────────────────────────────────────────────────────────────────

  getUsers(params?: AdminUserQueryParams): Observable<AdminUsersResponse> {
    return this.api.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, params).pipe(
      map((res: AdminUsersResponse & { docs?: AdminUser[]; users?: AdminUser[] }) => ({
        ...res,
        users: res.docs || res.users || [],
        pagination: this.mapPagination(res),
      }))
    );
  }

  updateUserRole(id: string, role: string): Observable<AdminUser> {
    return this.api
      .patch<{ message: string; user: AdminUser }, { role: string }>(
        `${API_ENDPOINTS.ADMIN.USERS}/${id}/role`,
        {
          role,
        }
      )
      .pipe(map((res) => res.user));
  }

  updateUser(id: string, data: Partial<AdminUser>): Observable<AdminUser> {
    return this.api
      .patch<
        { message: string; user: AdminUser },
        Partial<AdminUser>
      >(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, data)
      .pipe(map((res) => res.user));
  }

  restrictUser(id: string): Observable<AdminUser> {
    return this.api
      .patch<
        { message: string; user: AdminUser },
        object
      >(`${API_ENDPOINTS.ADMIN.USERS}/${id}/restrict`, {})
      .pipe(map((res) => res.user));
  }

  approveUser(id: string): Observable<AdminUser> {
    return this.api
      .patch<
        { message: string; user: AdminUser },
        object
      >(`${API_ENDPOINTS.ADMIN.USERS}/${id}/approve`, {})
      .pipe(map((res) => res.user));
  }

  // ─── Sellers ──────────────────────────────────────────────────────────────────

  getSellers(params?: AdminSellerQueryParams): Observable<AdminSellersResponse> {
    return this.api.get<AdminSellersResponse>(API_ENDPOINTS.ADMIN.SELLERS, params).pipe(
      map(
        (
          res: AdminSellersResponse & { docs?: AdminSellerInfo[]; sellers?: AdminSellerInfo[] }
        ) => ({
          ...res,
          sellers: res.docs || res.sellers || [],
          pagination: this.mapPagination(res),
        })
      )
    );
  }

  getSellerById(id: string): Observable<SellerDetail> {
    return this.api
      .get<{ message: string; seller: SellerDetail }>(`${API_ENDPOINTS.ADMIN.SELLERS}/${id}`)
      .pipe(map((res) => res.seller));
  }

  approveSeller(id: string): Observable<AdminSellerInfo> {
    return this.api
      .patch<
        { message: string; seller: AdminSellerInfo },
        object
      >(`${API_ENDPOINTS.ADMIN.SELLERS}/${id}/approve`, {})
      .pipe(map((res) => res.seller));
  }

  restrictSeller(id: string): Observable<AdminSellerInfo> {
    return this.api
      .patch<
        { message: string; seller: AdminSellerInfo },
        object
      >(`${API_ENDPOINTS.ADMIN.SELLERS}/${id}/restrict`, {})
      .pipe(map((res) => res.seller));
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  getProducts(params?: AdminProductQueryParams): Observable<AdminProductsResponse> {
    return this.api.get<AdminProductsResponse>(API_ENDPOINTS.ADMIN.PRODUCTS, params).pipe(
      map(
        (
          res: AdminProductsResponse & {
            docs?: import('../models/product.model').Product[];
            products?: import('../models/product.model').Product[];
          }
        ) => ({
          ...res,
          products: res.docs || res.products || [],
          pagination: this.mapPagination(res),
        })
      )
    );
  }

  getAdminProductById(id: string): Observable<import('../models/product.model').Product> {
    return this.api
      .get<{
        message: string;
        product: import('../models/product.model').Product;
      }>(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`)
      .pipe(map((res) => res.product));
  }

  recoverProduct(id: string): Observable<import('../models/product.model').Product> {
    return this.api
      .patch<
        { message: string; product: import('../models/product.model').Product },
        object
      >(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}/recover`, {})
      .pipe(map((res) => res.product));
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
  }

  // ─── Categories ───────────────────────────────────────────────────────────────
  // Categories use the public /category endpoint even in admin context

  getCategories(
    params?: Record<string, string>
  ): Observable<
    import('../models/category.model').CategoriesResponse & { pagination: Pagination | undefined }
  > {
    return this.api
      .get<import('../models/category.model').CategoriesResponse>(API_ENDPOINTS.CATEGORIES, params)
      .pipe(
        map((res) => ({
          ...res,
          categories: res.docs || res.categories || [],
          pagination: this.mapPagination(res),
        }))
      );
  }

  createCategory(
    formData: FormData
  ): Observable<import('../models/category.model').CategoryResponse> {
    return this.api.post<import('../models/category.model').CategoryResponse, FormData>(
      API_ENDPOINTS.CATEGORIES,
      formData
    );
  }

  updateCategory(
    id: string,
    formData: FormData
  ): Observable<import('../models/category.model').CategoryResponse> {
    return this.api.patch<import('../models/category.model').CategoryResponse, FormData>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
      formData
    );
  }

  deleteCategory(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  getAllOrders(params?: AdminOrderQueryParams): Observable<AdminOrdersResponse> {
    return this.api.get<AdminOrdersResponse>(API_ENDPOINTS.ADMIN.ORDERS, params).pipe(
      map((res: AdminOrdersResponse & { docs?: Order[]; orders?: Order[] }) => ({
        ...res,
        orders: res.docs || res.orders || [],
        pagination: this.mapPagination(res),
      })),
      catchError((err) => {
        console.error('Error fetching admin orders:', err);
        return of({ message: 'Error', orders: [] });
      })
    );
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.api
      .patch<{ message: string; order: Order }, { orderStatus: string }>(
        `${API_ENDPOINTS.ADMIN.ORDERS}/${id}/status`,
        {
          orderStatus: status,
        }
      )
      .pipe(map((res) => res.order));
  }

  getRecentOrders(
    params: AdminOrderQueryParams = { limit: '5', sort: 'newest' }
  ): Observable<AdminOrdersResponse> {
    return this.getAllOrders(params);
  }

  // ─── Coupons ──────────────────────────────────────────────────────────────────

  getCoupons(params?: AdminCouponQueryParams): Observable<AdminCouponsResponse> {
    return this.api.get<AdminCouponsResponse>(API_ENDPOINTS.ADMIN.COUPONS, params).pipe(
      map((res: AdminCouponsResponse & { docs?: Coupon[]; coupons?: Coupon[] }) => ({
        ...res,
        coupons: res.docs || res.coupons || [],
        pagination: this.mapPagination(res),
      }))
    );
  }

  createCoupon(data: CreateCouponPayload): Observable<Coupon> {
    return this.api
      .post<
        { message: string; coupon: Coupon },
        CreateCouponPayload
      >(API_ENDPOINTS.ADMIN.COUPONS, data)
      .pipe(map((res) => res.coupon));
  }

  updateCoupon(id: string, data: UpdateCouponPayload): Observable<Coupon> {
    return this.api
      .patch<
        { message: string; coupon: Coupon },
        UpdateCouponPayload
      >(`${API_ENDPOINTS.ADMIN.COUPONS}/${id}`, data)
      .pipe(map((res) => res.coupon));
  }

  deactivateCoupon(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.ADMIN.COUPONS}/${id}`);
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────────

  getReviews(params?: AdminReviewQueryParams): Observable<AdminReviewsResponse> {
    return this.api.get<AdminReviewsResponse>(API_ENDPOINTS.ADMIN.REVIEWS, params).pipe(
      map((res: AdminReviewsResponse & { docs?: AdminReview[]; reviews?: AdminReview[] }) => ({
        ...res,
        reviews: res.docs || res.reviews || [],
        pagination: this.mapPagination(res),
      }))
    );
  }

  deleteReview(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.REVIEWS}/${id}`);
  }

  // ─── Banners ──────────────────────────────────────────────────────────────────

  getBanners(params?: AdminBannerQueryParams): Observable<AdminBannersResponse> {
    return this.api.get<AdminBannersResponse>(API_ENDPOINTS.ADMIN.BANNERS, params).pipe(
      map((res: AdminBannersResponse & { docs?: Banner[]; banners?: Banner[] }) => ({
        ...res,
        banners: res.docs || res.banners || [],
        pagination: this.mapPagination(res),
      }))
    );
  }

  createBanner(formData: FormData): Observable<Banner> {
    return this.api
      .post<
        {
          message: string;
          banner: Banner;
        },
        FormData
      >(API_ENDPOINTS.ADMIN.BANNERS, formData)
      .pipe(map((res) => res.banner));
  }

  updateBanner(id: string, formData: FormData): Observable<Banner> {
    return this.api
      .patch<
        {
          message: string;
          banner: Banner;
        },
        FormData
      >(`${API_ENDPOINTS.ADMIN.BANNERS}/${id}`, formData)
      .pipe(map((res) => res.banner));
  }

  deleteBanner(id: string): Observable<unknown> {
    return this.api.delete(`${API_ENDPOINTS.ADMIN.BANNERS}/${id}`);
  }

  activateBanner(id: string): Observable<unknown> {
    return this.api.patch(`${API_ENDPOINTS.ADMIN.BANNERS}/${id}/activate`, {});
  }

  private mapPagination(res: {
    pagination?: Pagination;
    data?: { totalPages?: number; page?: number; totalDocs?: number };
    pages?: number;
    totalPages?: number;
    page?: number;
    total?: number;
    totalDocs?: number;
  }): Pagination | undefined {
    if (res.pagination) return res.pagination;
    const data = res.data;

    // Handle mongoose-paginate-v2 object in 'data'
    if (data && data.totalPages !== undefined) {
      return {
        currentPage: Number(data.page || 1),
        totalPages: Number(data.totalPages || 1),
        totalItems: Number(data.totalDocs || 0),
      };
    }

    // Handle flat properties in root
    if (res.pages !== undefined || res.totalPages !== undefined) {
      return {
        currentPage: Number(res.page || 1),
        totalPages: Number(res.pages || res.totalPages || 1),
        totalItems: Number(res.total || res.totalDocs || 0),
      };
    }

    return undefined;
  }
}
