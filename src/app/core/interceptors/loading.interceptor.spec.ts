import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('LoadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: LoadingService, useValue: loadingSpy },
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });
  it('should call show before request', () => {
    http.get('/test').subscribe();

    expect(loadingSpy.show).toHaveBeenCalled();
  });
  it('should call hide after success', () => {
    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    req.flush({});

    expect(loadingSpy.hide).toHaveBeenCalled();
  });
  it('should call hide after error', () => {
    http.get('/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(loadingSpy.hide).toHaveBeenCalled();
  });
});
