import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment.prod';
import { CreateCategoryPayload } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        CategoryService,
      ],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all categories', () => {
    const mockResponse = {
      message: 'Categories fetched successfully',
      categories: [
        {
          _id: '1',
          name: 'Cat 1',
          slug: 'cat-1',
          image: { secure_url: '', public_id: '' },
          createdBy: '',
          createdAt: '',
        },
      ],
    };

    service.getAll().subscribe((res) => {
      expect(res.categories.length).toBe(1);
      expect(res.categories[0].name).toBe('Cat 1');
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CATEGORIES}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a category with FormData', () => {
    const payload: CreateCategoryPayload = { name: 'New Cat' };
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockResponse = { message: 'Created', category: { _id: '1', name: 'New Cat' } };

    service.create(payload, mockFile).subscribe((res) => {
      expect(res.message).toBe('Created');
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CATEGORIES}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get('name')).toBe('New Cat');
    expect(req.request.body.get('image')).toBeTruthy();
    req.flush(mockResponse);
  });

  it('should update a category with FormData', () => {
    const categoryId = '123';
    const payload = { name: 'Updated Cat' };
    const mockResponse = { message: 'Updated', category: { _id: '123', name: 'Updated Cat' } };

    service.update(categoryId, payload).subscribe((res) => {
      expect(res.message).toBe('Updated');
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CATEGORIES}/${categoryId}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.body.get('name')).toBe('Updated Cat');
    req.flush(mockResponse);
  });

  it('should delete a category', () => {
    const categoryId = '123';
    const mockResponse = { message: 'Deleted' };

    service.delete(categoryId).subscribe((res) => {
      expect(res.message).toBe('Deleted');
    });

    const req = httpMock.expectOne(`${baseUrl}${API_ENDPOINTS.CATEGORIES}/${categoryId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
