import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../core/models/auth.model';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockWishlistService: jasmine.SpyObj<WishlistService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      isLoggedIn: signal(false),
      currentUser: signal<User | null>(null),
    });
    mockCartService = jasmine.createSpyObj('CartService', [], {
      itemCount: signal(0),
    });
    mockWishlistService = jasmine.createSpyObj('WishlistService', [], {
      itemCount: signal(0),
    });

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
        { provide: WishlistService, useValue: mockWishlistService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show cart item count from CartService.itemCount signal', () => {
    (mockCartService.itemCount as WritableSignal<number>).set(5);
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('a[routerLink="/cart"] .icon-badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('5');
  });

  it('should show wishlist item count from WishlistService.itemCount signal', () => {
    (mockWishlistService.itemCount as WritableSignal<number>).set(3);
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('a[routerLink="/wishlist"] .icon-badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('3');
  });

  it('should show Login/Register links when isLoggedIn() is false', () => {
    (mockAuthService.isLoggedIn as WritableSignal<boolean>).set(false);
    fixture.detectChanges();
    const loginLink = fixture.debugElement.query(By.css('a[routerLink="/auth/login"]'));
    const registerLink = fixture.debugElement.query(By.css('a[routerLink="/auth/register"]'));
    expect(loginLink).toBeTruthy();
    expect(registerLink).toBeTruthy();
  });

  it('should show user name and logout option when isLoggedIn() is true', () => {
    (mockAuthService.isLoggedIn as WritableSignal<boolean>).set(true);
    (mockAuthService.currentUser as WritableSignal<User | null>).set({
      userName: 'John Doe',
    } as User);
    fixture.detectChanges();

    // Check user name in desktop header trigger
    const userNameSpan = fixture.debugElement.query(By.css('.user-name'));
    expect(userNameSpan.nativeElement.textContent).toContain('John Doe');

    // Check if logout button exists in dropdown
    const logoutBtn = fixture.debugElement.query(By.css('.logout-item'));
    expect(logoutBtn).toBeTruthy();
  });

  it('should call authService.logout() and navigate to /auth/login when logout is called', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
