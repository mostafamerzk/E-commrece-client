import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from './core/services/auth.service';
import { signal, Component, provideZonelessChangeDetection, WritableSignal } from '@angular/core';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// Mock components
@Component({ selector: 'app-home', standalone: true, template: '' })
class MockHomeComponent {}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
class MockAuthLayoutComponent {}

@Component({ selector: 'app-login', standalone: true, template: '' })
class MockLoginComponent {}

@Component({ selector: 'app-product-list', standalone: true, template: '' })
class MockProductListComponent {}

@Component({ selector: 'app-cart', standalone: true, template: '' })
class MockCartComponent {}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
class MockAdminLayoutComponent {}

@Component({ selector: 'app-admin-dashboard', standalone: true, template: '' })
class MockAdminDashboardComponent {}

@Component({ selector: 'app-not-found', standalone: true, template: '' })
class MockNotFoundComponent {}

// Test routes mirroring app.routes.ts but with direct component references
const testRoutes: Routes = [
  { path: '', component: MockHomeComponent },
  {
    path: 'auth',
    component: MockAuthLayoutComponent,
    canActivate: [guestGuard],
    children: [{ path: 'login', component: MockLoginComponent }],
  },
  {
    path: 'products',
    children: [{ path: '', component: MockProductListComponent }],
  },
  { path: 'cart', component: MockCartComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: MockAdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [{ path: '', component: MockAdminDashboardComponent }],
  },
  { path: '**', component: MockNotFoundComponent },
];

interface AuthFacadeMock {
  isLoggedIn: WritableSignal<boolean>;
  isAdmin: WritableSignal<boolean>;
  isSeller: WritableSignal<boolean>;
  currentUser: WritableSignal<unknown>;
  login: () => void;
  logout: () => void;
}

describe('App Routing', () => {
  let authFacadeMock: AuthFacadeMock;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    authFacadeMock = {
      isLoggedIn: signal(false),
      isAdmin: signal(false),
      isSeller: signal(false),
      currentUser: signal(null),
      login: () => {},
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(testRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authFacadeMock },
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should navigate to "" (Home)', async () => {
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('should navigate to "/products"', async () => {
    await harness.navigateByUrl('/products');
    expect(TestBed.inject(Router).url).toBe('/products');
  });

  it('should redirect /cart to /auth/login when NOT logged in', async () => {
    authFacadeMock.isLoggedIn.set(false);
    await harness.navigateByUrl('/cart');
    expect(TestBed.inject(Router).url).toBe('/auth/login');
  });

  it('should allow /cart when logged in', async () => {
    authFacadeMock.isLoggedIn.set(true);
    await harness.navigateByUrl('/cart');
    expect(TestBed.inject(Router).url).toBe('/cart');
  });

  it('should redirect /admin to / when NOT an admin', async () => {
    authFacadeMock.isLoggedIn.set(true);
    authFacadeMock.isAdmin.set(false);
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('should allow /admin when user is admin', async () => {
    authFacadeMock.isLoggedIn.set(true);
    authFacadeMock.isAdmin.set(true);
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/admin');
  });

  it('should navigate to any unknown route and stay there (NotFoundComponent)', async () => {
    await harness.navigateByUrl('/unknown-route-123');
    expect(TestBed.inject(Router).url).toBe('/unknown-route-123');
  });
});
