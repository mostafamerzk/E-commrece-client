import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { AUTH_FACADE, TOAST_FACADE } from '../tokens/app.tokens';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const authServiceSpy = jasmine.createSpyObj('AuthFacade', ['logout']);
  const toastSpy = jasmine.createSpyObj('ToastFacade', ['show']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_FACADE, useValue: authServiceSpy },
        { provide: TOAST_FACADE, useValue: toastSpy },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should call logout on 401', () => {
    http.get('/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should show toast on server error', () => {
    http.get('/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(toastSpy.show).toHaveBeenCalled();
  });
});
