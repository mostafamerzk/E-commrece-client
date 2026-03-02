/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { sellerGuard } from './seller.guard';
import { AuthService } from '../services/auth.service';
import { provideZonelessChangeDetection, signal } from '@angular/core';

describe('sellerGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isSeller: signal(false),
      isAdmin: signal(false),
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

  it('should allow access if user is seller', () => {
    (
      Object.getOwnPropertyDescriptor(authServiceSpy, 'isSeller')?.get as jasmine.Spy
    ).and.returnValue(signal(true));

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should allow access if user is admin', () => {
    (
      Object.getOwnPropertyDescriptor(authServiceSpy, 'isAdmin')?.get as jasmine.Spy
    ).and.returnValue(signal(true));

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should redirect to home if user is neither seller nor admin', () => {
    const mockUrlTree = {} as UrlTree;
    routerSpy.parseUrl.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => sellerGuard({} as any, {} as any));
    expect(result).toBe(mockUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/');
  });
});
