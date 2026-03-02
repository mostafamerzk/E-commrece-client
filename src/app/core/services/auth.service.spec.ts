/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { User, AuthResponse, LoginPayload } from '../models/auth.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockUser: User = {
    _id: '123',
    userName: 'testuser',
    email: 'test@example.com',
    role: 'customer',
    isBlocked: false,
  };

  const mockAdmin: User = { ...mockUser, role: 'admin' };
  const mockSeller: User = { ...mockUser, role: 'seller' };

  const mockAuthResponse: AuthResponse = {
    message: 'Success',
    token: 'mock-token',
    user: mockUser,
  };

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    apiSpy = jasmine.createSpyObj('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: StorageService, useValue: storageSpy },
        { provide: ApiService, useValue: apiSpy },
      ],
    });
  });

  it('should be created', () => {
    storageSpy.getItem.and.returnValue(null);
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with null user and token if storage is empty', () => {
      storageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(AuthService);

      expect(service.currentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.role()).toBeNull();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isSeller()).toBeFalse();
    });

    it('should initialize with stored data', () => {
      storageSpy.getItem.and.callFake(((key: string) => {
        if (key === 'user') return mockUser;
        if (key === 'access_token') return 'some-token';
        return null;
      }) as any);
      service = TestBed.inject(AuthService);

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.role()).toBe('customer');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      storageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(AuthService);
    });

    it('should call api.post and update state/storage on success', (done) => {
      const payload: LoginPayload = { email: 'test@example.com', password: 'password' };
      apiSpy.post.and.returnValue(of(mockAuthResponse));

      service.login(payload).subscribe(() => {
        expect(apiSpy.post).toHaveBeenCalledWith('/auth/login', payload);
        expect(storageSpy.setItem).toHaveBeenCalledWith('access_token', 'mock-token');
        expect(storageSpy.setItem).toHaveBeenCalledWith('user', mockUser);
        expect(storageSpy.setItem).toHaveBeenCalledWith('role', 'customer');

        expect(service.currentUser()).toEqual(mockUser);
        expect(service.isLoggedIn()).toBeTrue();
        done();
      });
    });
  });

  describe('logout', () => {
    it('should clear storage and reset signals', () => {
      storageSpy.getItem.and.callFake(((key: string) => {
        if (key === 'user') return mockUser;
        if (key === 'access_token') return 'some-token';
        return null;
      }) as any);
      service = TestBed.inject(AuthService);

      service.logout();

      expect(storageSpy.removeItem).toHaveBeenCalledWith('access_token');
      expect(storageSpy.removeItem).toHaveBeenCalledWith('user');
      expect(storageSpy.removeItem).toHaveBeenCalledWith('role');
      expect(service.currentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('Role Computed Signals', () => {
    it('should return true for isAdmin when user is admin', () => {
      storageSpy.getItem.and.callFake(((key: string) => {
        if (key === 'user') return mockAdmin;
        if (key === 'access_token') return 'token';
        return null;
      }) as any);
      service = TestBed.inject(AuthService);
      expect(service.isAdmin()).toBeTrue();
      expect(service.isSeller()).toBeFalse();
    });

    it('should return true for isSeller when user is seller', () => {
      storageSpy.getItem.and.callFake(((key: string) => {
        if (key === 'user') return mockSeller;
        if (key === 'access_token') return 'token';
        return null;
      }) as any);
      service = TestBed.inject(AuthService);
      expect(service.isSeller()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
    });
  });
});
