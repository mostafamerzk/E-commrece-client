import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { signal } from '@angular/core';
import { User } from '../../core/models/auth.model';
import { By } from '@angular/platform-browser';
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

  it('should render header and footer', () => {
    const header = fixture.debugElement.query(By.css('app-header'));
    const footer = fixture.debugElement.query(By.css('app-footer'));
    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });
});
