import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product, ProductsResponse } from '../../../../core/models/product.model';
import { Category, CategoriesResponse } from '../../../../core/models/category.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: jasmine.SpyObj<ProductService>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let routerMock: jasmine.SpyObj<Router>;
  let queryParamsSubject: BehaviorSubject<Params>;

  const mockProducts: Product[] = [
    {
      _id: '1',
      title: 'P1',
      price: 100,
      finalPrice: 100,
      stock: 5,
      mainImage: { secure_url: '', public_id: '' },
      description: '',
      slug: 'p1',
      categoryId: 'cat1',
      avgRating: 0,
      images: [],
      sellerId: '12',
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    },
    {
      _id: '2',
      title: 'P2',
      price: 200,
      finalPrice: 200,
      stock: 0,
      mainImage: { secure_url: '', public_id: '' },
      description: '',
      slug: 'p2',
      categoryId: 'cat1',
      avgRating: 0,
      images: [],
      sellerId: '12',
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const mockCategories: Category[] = [
    {
      _id: 'cat1',
      name: 'Category 1',
      slug: 'cat-1',
      image: { secure_url: '', public_id: '' },
      createdBy: '12',
      createdAt: '',
      updatedAt: '',
    },
  ];

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject<Params>({});

    productServiceMock = jasmine.createSpyObj('ProductService', ['getAll']);
    productServiceMock.getAll.and.returnValue(
      of({
        message: 'Success',
        products: mockProducts,
        pagination: { totalItems: 2, totalPages: 1, currentPage: 1, limit: 12 },
      } as ProductsResponse)
    );

    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getAll']);
    categoryServiceMock.getAll.and.returnValue(
      of({
        categories: mockCategories,
        message: 'Success',
      } as CategoriesResponse)
    );

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductService, useValue: productServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: { queryParams: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and products on init', () => {
    expect(categoryServiceMock.getAll).toHaveBeenCalled();
    expect(productServiceMock.getAll).toHaveBeenCalled();
    expect(component.products()).toEqual(mockProducts);
    expect(component.categories()).toEqual(mockCategories);
  });

  it('should update state based on query params', () => {
    queryParamsSubject.next({ search: 'phone', category: 'cat1', minPrice: '100' });
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('phone');
    expect(component.selectedCategory()).toBe('cat1');
    expect(component.priceRange()).toEqual([100, 10000]);
    expect(productServiceMock.getAll).toHaveBeenCalled();
  });

  it('should navigate with correct params when clearFilters is called', () => {
    component.clearFilters();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({
          search: null,
          category: null,
          minPrice: null,
          inStock: null,
        }),
      })
    );
  });

  it('should update activeFilterCount correctly', () => {
    expect(component.activeFilterCount()).toBe(0);

    component.searchQuery.set('test');
    expect(component.activeFilterCount()).toBe(1);

    component.selectedCategory.set('cat1');
    expect(component.activeFilterCount()).toBe(2);

    component.inStockOnly.set(true);
    expect(component.activeFilterCount()).toBe(3);
  });

  it('should call updateUrl on sort change', () => {
    component.selectedSort.set('price');
    component.onSortChange();
    expect(routerMock.navigate).toHaveBeenCalled();
  });
});
