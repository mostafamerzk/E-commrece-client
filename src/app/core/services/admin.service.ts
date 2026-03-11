import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AdminStatsResponse,
  AdminOrdersResponse,
  AdminOrderQueryParams,
  AdminUsersResponse,
  AdminUserResponse,
  AdminUserQueryParams,
} from '../models/admin.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);

  /**
   * Fetch dashboard KPI statistics
   */
  getStats(): Observable<AdminStatsResponse> {
    return this.api.get<AdminStatsResponse>(API_ENDPOINTS.ADMIN.STATS).pipe(
      catchError((err) => {
        console.error('Error fetching admin stats:', err);
        return of({ message: 'Error', stats: [] });
      })
    );
  }

  /**
   * Fetch orders for admin management
   * @param params Filtering and pagination params
   */
  getAllOrders(params?: AdminOrderQueryParams): Observable<AdminOrdersResponse> {
    return this.api.get<AdminOrdersResponse>(API_ENDPOINTS.ADMIN.ORDERS, params).pipe(
      catchError((err) => {
        console.error('Error fetching admin orders:', err);
        return of({ message: 'Error', orders: [] });
      })
    );
  }

  /**
   * Helper for dashboard latest orders
   */
  getRecentOrders(limit: number = 5): Observable<AdminOrdersResponse> {
    return this.getAllOrders({
      limit: limit.toString(),
      sort: '-createdAt',
    });
  }

  /**
   * Fetch all users for admin management
   * @param params Filtering and pagination params
   */
  getAllUsers(params?: AdminUserQueryParams): Observable<AdminUsersResponse> {
    console.log('[AdminService] getAllUsers - Request:', {
      endpoint: API_ENDPOINTS.ADMIN.USERS,
      params: params || {},
      token: localStorage.getItem('access_token')?.substring(0, 20) + '...',
    });
    return this.api.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, params).pipe(
      catchError((err) => {
        console.error('[AdminService] getAllUsers - Error:', {
          status: err.status,
          message: err.message,
          error: err.error,
        });
        // Re-throw authentication and authorization errors
        if (err.status === 401 || err.status === 403) {
          throw err;
        }
        return of({
          message: 'Error',
          data: {
            docs: [],
            totalDocs: 0,
            limit: 10,
            totalPages: 0,
            page: 1,
            pagingCounter: 0,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
          },
        });
      })
    );
  }

  /**
   * Get a single user by ID
   */
  getUserById(userId: string): Observable<AdminUserResponse> {
    return this.api.get<AdminUserResponse>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`).pipe(
      catchError((err) => {
        console.error('Error fetching user:', err);
        return of({ message: 'Error', data: {} as User });
      })
    );
  }

  /**
   * Approve a user account
   * PATCH /admin/users/:id/approve
   */
  approveUser(userId: string): Observable<AdminUserResponse> {
    return this.api
      .patch<AdminUserResponse, object>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/approve`, {})
      .pipe(
        catchError((err) => {
          console.error('Error approving user:', err);
          return of({ message: 'Error', data: {} as User });
        })
      );
  }

  /**
   * Restrict (ban) a user account
   * PATCH /admin/users/:id/restrict
   */
  restrictUser(userId: string): Observable<AdminUserResponse> {
    return this.api
      .patch<AdminUserResponse, object>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/restrict`, {})
      .pipe(
        catchError((err) => {
          console.error('Error restricting user:', err);
          return of({ message: 'Error', data: {} as User });
        })
      );
  }

  /**
   * Restore a deleted user account
   * PATCH /admin/users/:id/restore
   */
  restoreUser(userId: string): Observable<AdminUserResponse> {
    return this.api
      .patch<AdminUserResponse, object>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/restore`, {})
      .pipe(
        catchError((err) => {
          console.error('Error restoring user:', err);
          return of({ message: 'Error', data: {} as User });
        })
      );
  }
}
