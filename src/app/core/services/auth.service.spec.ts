import { TestBed } from '@angular/core/testing';
import { AuthService, LoginResponse } from './auth.service';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockUser: User = {
    _id: '123',
    userName: 'testUser',
    email: 'test@example.com',
    role: 'customer',
  };

  const mockAdmin: User = { ...mockUser, role: 'admin' };
  const mockSeller: User = { ...mockUser, role: 'seller' };

  const mockLoginResponse: LoginResponse & { user: User } = {
    success: 'true',
    message: 'Login successful',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: StorageService, useValue: storageSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
  });

  it('should be created', () => {
    storageSpy.getItem.and.returnValue(null);
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with null user and token if storage and localStorage are empty', () => {
      storageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(AuthService);

      expect(service.currentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isSeller()).toBeFalse();
    });

    it('should initialize with stored data', () => {
      storageSpy.getItem.and.returnValue(mockUser);
      localStorage.setItem('access_token', 'stored-token');

      service = TestBed.inject(AuthService);

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  describe('login', () => {
    beforeEach(() => {
      storageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(AuthService);
    });

    it('should call http.post, fetch profile, and update state/localStorage on success', async () => {
      httpSpy.post.and.returnValue(of(mockLoginResponse));
      httpSpy.get.and.returnValue(of(mockUser));

      const result = await service.login('test@example.com', 'password');

      expect(httpSpy.post).toHaveBeenCalled();
      expect(httpSpy.get).toHaveBeenCalledWith(`${environment.apiUrl}/user/profile`);
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
      expect(storageSpy.setItem).toHaveBeenCalledWith('user', mockUser);

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTrue();
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should clear storage and reset signals', () => {
      storageSpy.getItem.and.returnValue(mockUser);
      localStorage.setItem('access_token', 'active-token');
      service = TestBed.inject(AuthService);

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(storageSpy.removeItem).toHaveBeenCalledWith('user');
      expect(service.currentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('Role Computed Signals', () => {
    it('should reactive correctly to user role changes', () => {
      storageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(AuthService);

      // Initially false
      expect(service.isAdmin()).toBeFalse();
      expect(service.isSeller()).toBeFalse();

      // Set Admin
      service.currentUser.set(mockAdmin);
      expect(service.isAdmin()).toBeTrue();
      expect(service.isSeller()).toBeFalse();

      // Set Seller
      service.currentUser.set(mockSeller);
      expect(service.isAdmin()).toBeFalse();
      expect(service.isSeller()).toBeTrue();
    });
  });
});
