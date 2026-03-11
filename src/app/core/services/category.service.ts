import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Observable, map } from 'rxjs';
import {
  CategoriesResponse,
  Category,
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../models/category.model';
import { MessageResponse } from '../models/shared.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private api = inject(ApiService);
  private readonly endpoint = API_ENDPOINTS.CATEGORIES;

  // Cache for all categories
  categories = signal<Category[]>([]);

  loadCategories(): void {
    if (this.categories().length > 0) return;
    this.getAll().subscribe({
      next: (res) => this.categories.set(res.categories),
      error: (err) => console.error('Error loading categories', err),
    });
  }

  getCategoryName(id: string): string {
    const category = this.categories().find((c) => c._id === id);
    return category ? category.name : 'Loading...';
  }

  getAll(): Observable<CategoriesResponse> {
    return this.api.get<CategoriesResponse>(this.endpoint).pipe(
      map((res) => ({
        ...res,
        categories: res.docs || res.categories || [],
      }))
    );
  }

  getById(id: string): Observable<CategoryResponse> {
    return this.api.get<CategoryResponse>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateCategoryPayload, image: File): Observable<CategoryResponse> {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.parentCategoryId) {
      formData.append('parentCategoryId', payload.parentCategoryId);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }
    formData.append('image', image);

    // ApiService.post handles the body correctly even if it's FormData
    return this.api.post<CategoryResponse, FormData>(this.endpoint, formData);
  }

  update(id: string, payload: UpdateCategoryPayload, image?: File): Observable<CategoryResponse> {
    const formData = new FormData();
    if (payload.name) {
      formData.append('name', payload.name);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (image) {
      formData.append('image', image);
    }

    return this.api.patch<CategoryResponse, FormData>(`${this.endpoint}/${id}`, formData);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.api.delete<MessageResponse>(`${this.endpoint}/${id}`);
  }
}
