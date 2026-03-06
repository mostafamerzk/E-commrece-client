import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { CategoriesResponse } from '../models/category.model';
import { ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  getCategories(): Observable<CategoriesResponse> {
    return this.categoryService.getAll();
  }

  getFeaturedProducts(): Observable<ProductsResponse> {
    return this.productService.getFeatured();
  }

  // Load both at the same time (faster)
  getHomeData(): Observable<[CategoriesResponse, ProductsResponse]> {
    return forkJoin([this.categoryService.getAll(), this.productService.getFeatured()]);
  }
}
