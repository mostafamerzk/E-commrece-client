/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { provideZonelessChangeDetection, signal } from '@angular/core';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoggedIn: signal(false),
    });
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should allow access if user is logged in', () => {
    (authServiceSpy.isLoggedIn as any).set(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should redirect to login if user is not logged in', () => {
    const mockUrlTree = {} as UrlTree;
    routerSpy.parseUrl.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(mockUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/auth/login');
  });
});
