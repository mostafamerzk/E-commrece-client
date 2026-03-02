import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment.prod';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call correct full URL (baseUrl + endpoint)', () => {
    service.get('/products').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');

    req.flush({});
  });

  it('should pass query params as HttpParams', () => {
    service.get('/products', { page: 1, limit: 10 }).subscribe();

    const req = httpMock.expectOne(
      (req) =>
        req.url.includes('/products') &&
        req.params.get('page') === '1' &&
        req.params.get('limit') === '10'
    );

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should handle and re-throw errors via catchError', () => {
    const errorResponse = { message: 'Test error' };

    service.get('/products').subscribe({
      next: () => fail('should not succeed'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.error.message).toBe('Test error');
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush(errorResponse, { status: 500, statusText: 'Server Error' });
  });

  it('should post body correctly', () => {
    const body = { name: 'Test', price: 100 };
    service.post('/products', body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should put body correctly', () => {
    const body = { name: 'Updated' };
    service.put('/products/1', body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should delete correctly', () => {
    service.delete('/products/1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
