import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ProductQueryParams, ProductsResponse, ProductResponse } from '../models/product.model';
import { MessageResponse } from '../models/shared.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private api = inject(ApiService);

  /**
   * Fetch all products with optional filters and pagination.
   * @param params Query parameters for search, filtering, and sorting.
   */
  getAll(params?: ProductQueryParams): Observable<ProductsResponse> {
    return this.api.get<ProductsResponse>(
      API_ENDPOINTS.PRODUCTS,
      params as Record<string, unknown>
    );
  }

  /**
   * Fetch a single product by its unique ID.
   * Note: This endpoint should return the product with its reviews populated.
   * @param id The product MongoDB ObjectId.
   */
  getById(id: string): Observable<ProductResponse> {
    return this.api.get<ProductResponse>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  }

  /**
   * Create a new product.
   * Uses multipart/form-data for image uploads.
   * @param formData Validated product data including mainImage and optional subImages.
   */
  create(formData: FormData): Observable<ProductResponse> {
    return this.api.post<ProductResponse, FormData>(API_ENDPOINTS.PRODUCTS, formData);
  }

  /**
   * Update an existing product.
   * Uses PATCH for partial updates and multipart/form-data for potential image changes.
   * @param id The product MongoDB ObjectId.
   * @param formData Partial product data to update.
   */
  update(id: string, formData: FormData): Observable<ProductResponse> {
    return this.api.patch<ProductResponse, FormData>(`${API_ENDPOINTS.PRODUCTS}/${id}`, formData);
  }
  private readonly endpoint = API_ENDPOINTS.PRODUCTS;
  getFeatured(page = 1, limit = 8): Observable<ProductsResponse> {
    return this.api.get<ProductsResponse>(this.endpoint, {
      sort: '-createdAt',
      page: String(page),
      limit: String(limit),
    });
  }
  /**
   * Delete a product (Soft Delete).
   * @param id The product MongoDB ObjectId.
   * @param isAdmin Whether the action is performed by an admin.
   */
  delete(id: string, isAdmin: boolean = false): Observable<MessageResponse> {
    console.log(id);
    const endpoint = isAdmin
      ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`
      : `${API_ENDPOINTS.PRODUCTS}/${id}`;
    return this.api.delete<MessageResponse>(endpoint);
  }
  /**
   * Restore a soft-deleted product.
   * @param id The product MongoDB ObjectId.
   * @param isAdmin Whether the action is performed by an admin (Required).
   */
  restore(id: string, isAdmin: boolean = true): Observable<MessageResponse> {
    const endpoint = isAdmin
      ? `${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}/recover`
      : `${API_ENDPOINTS.PRODUCTS}/${id}/recover`;
    return this.api.patch<MessageResponse, object>(endpoint, {});
  }
}
