import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AdminStatsResponse,
  AdminOrdersResponse,
  AdminOrderQueryParams,
} from '../models/admin.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
}
