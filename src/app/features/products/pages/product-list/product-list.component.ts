import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product, ProductQueryParams } from '../../../../core/models/product.model';
import { Category } from '../../../../core/models/category.model';
// Assume these exist as per instructions
import { CategoryService } from '../../../../core/services/category.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

// PrimeNG Imports
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DrawerModule } from 'primeng/drawer';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BreadcrumbModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CheckboxModule,
    SliderModule,
    ToggleSwitchModule,
    SelectModule,
    RadioButtonModule,
    PaginatorModule,
    DrawerModule,
    SkeletonModule,
    BadgeModule,
    ButtonModule,
    ProductCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Data Signals
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  totalProducts = signal(0);
  isLoading = signal(false);

  // Filter State Signals
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  priceRange = signal<[number, number]>([0, 10000]);
  inStockOnly = signal(false);
  selectedSort = signal('-createdAt');
  currentPage = signal(1);
  pageSize = 12;

  // View State
  filterDrawerOpen = signal(false);

  // Constants
  sortOptions = [
    { label: 'Newest', value: '-createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Best Rated', value: '-rating' },
  ];

  breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems = [{ label: 'Products' }];

  activeFilterCount = computed(
    () =>
      (this.selectedCategory() !== null ? 1 : 0) +
      (this.inStockOnly() ? 1 : 0) +
      (this.searchQuery() ? 1 : 0) +
      (this.priceRange()[0] > 0 || this.priceRange()[1] < 10000 ? 1 : 0)
  );

  constructor() {
    // Sync URL params to local signal state on init/navigation
    this.route.queryParams.subscribe((params) => {
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      } else {
        this.selectedCategory.set(null);
      }
      if (params['minPrice'] || params['maxPrice']) {
        this.priceRange.set([Number(params['minPrice'] || 0), Number(params['maxPrice'] || 10000)]);
      }
      if (params['inStock']) this.inStockOnly.set(params['inStock'] === 'true');
      if (params['sort']) this.selectedSort.set(params['sort']);
      if (params['page']) this.currentPage.set(Number(params['page']));

      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.categories),
      error: (err) => console.error('Error loading categories', err),
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const params: ProductQueryParams = {
      search: this.searchQuery() || undefined,
      categoryId: this.selectedCategory() || undefined,
      minPrice: this.priceRange()[0].toString(),
      maxPrice: this.priceRange()[1].toString(),
      sort: this.selectedSort(),
      page: this.currentPage().toString(),
      limit: this.pageSize.toString(),
    };

    this.productService.getAll(params).subscribe({
      next: (res) => {
        let filteredProducts = res.products;
        if (this.inStockOnly()) {
          filteredProducts = filteredProducts.filter((p) => p.stock > 0);
        }
        this.products.set(filteredProducts);
        this.totalProducts.set(
          this.inStockOnly() ? filteredProducts.length : res.pagination.totalItems
        );
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1); // Reset to page 1 on filter change
    this.updateUrl();
  }

  onSortChange(): void {
    this.updateUrl();
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set((event.page || 0) + 1);
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUrl(): void {
    const queryParams = {
      search: this.searchQuery() || null,
      category: this.selectedCategory() || null,
      minPrice: this.priceRange()[0] > 0 ? this.priceRange()[0] : null,
      maxPrice: this.priceRange()[1] < 10000 ? this.priceRange()[1] : null,
      inStock: this.inStockOnly() ? 'true' : null,
      sort: this.selectedSort(),
      page: this.currentPage() > 1 ? this.currentPage() : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.priceRange.set([0, 10000]);
    this.inStockOnly.set(false);
    this.selectedSort.set('-createdAt');
    this.currentPage.set(1);
    this.updateUrl();
  }
}
