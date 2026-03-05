import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
    ],
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/pages/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/products/pages/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
      },
    ],
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/pages/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/orders/pages/order-list/order-list.component').then(
            (m) => m.OrderListComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/orders/pages/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
    ],
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/pages/wishlist/wishlist.component').then(
        (m) => m.WishlistComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'seller',
    loadComponent: () =>
      import('./features/seller/pages/dashboard/seller-dashboard.component').then(
        (m) => m.SellerDashboardComponent
      ),
    canActivate: [authGuard, sellerGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/pages/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
