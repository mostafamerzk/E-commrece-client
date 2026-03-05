import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ProductsResponse, ProductResponse, ProductQueryParams } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.PRODUCTS;

  getAll(params?: ProductQueryParams): Observable<ProductsResponse> {
    return this.api.get<ProductsResponse>(this.endpoint, params as Record<string, unknown>);
  }

  getFeatured(page = 1, limit = 8): Observable<ProductsResponse> {
    return this.api.get<ProductsResponse>(this.endpoint, {
      sort: '-createdAt',
      page: String(page),
      limit: String(limit),
    });
  }

  getById(id: string): Observable<ProductResponse> {
    return this.api.get<ProductResponse>(`${this.endpoint}/${id}`);
  }
}
