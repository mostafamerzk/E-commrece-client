import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from './cache.interceptor';
import { CacheService } from '../services/cache.service';

describe('CacheInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let cacheService: jasmine.SpyObj<CacheService>;

  beforeEach(() => {
    const cacheSpy = jasmine.createSpyObj('CacheService', ['get', 'set', 'clear']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([cacheInterceptor])),
        { provide: CacheService, useValue: cacheSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    cacheService = TestBed.inject(CacheService) as jasmine.SpyObj<CacheService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should cache GET requests', () => {
    const mockData = { name: 'Test Product' };
    const url = '/api/product/1';

    cacheService.get.and.returnValue(null);

    httpClient.get(url).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(cacheService.set).toHaveBeenCalled();
  });

  it('should return cached response if available', () => {
    const mockData = { name: 'Cached Product' };
    const url = '/api/product/1';

    cacheService.get.and.returnValue(mockData);

    httpClient.get(url).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    httpMock.expectNone(url);
  });

  it('should invalidate cache on POST request', () => {
    const url = '/api/product';
    const body = { name: 'New Product' };

    httpClient.post(url, body).subscribe();

    const req = httpMock.expectOne(url);
    req.flush({}, { status: 201, statusText: 'Created' });

    expect(cacheService.clear).toHaveBeenCalledWith('product');
  });

  it('should NOT cache requests with Authorization header for sensitive data', () => {
    const url = '/api/cart';
    const headers = { Authorization: 'Bearer token' };

    httpClient.get(url, { headers }).subscribe();

    const req = httpMock.expectOne(url);
    req.flush({});

    expect(cacheService.get).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });
});
