/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';
import { provideZonelessChangeDetection, signal } from '@angular/core';

describe('guestGuard', () => {
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

  it('should allow access if user is NOT logged in', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should redirect to home if user is already logged in', () => {
    (authServiceSpy.isLoggedIn as any).set(true);
    const mockUrlTree = {} as UrlTree;
    routerSpy.parseUrl.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
    expect(result).toBe(mockUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/');
  });
});
