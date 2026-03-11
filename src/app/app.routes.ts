import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then((m) => m.HomeComponent),
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
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./shared/components/profile/profile.component').then((m) => m.ProfileComponent),
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
            path: 'checkout',
            loadComponent: () =>
              import('./features/orders/pages/checkout/checkout.component').then(
                (m) => m.CheckoutComponent
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
        path: 'payment',
        canActivate: [authGuard],
        children: [
          {
            path: 'success',
            loadComponent: () =>
              import('./features/orders/pages/payment-success/payment-success.component').then(
                (m) => m.PaymentSuccessComponent
              ),
          },
          {
            path: 'cancel',
            loadComponent: () =>
              import('./features/orders/pages/payment-cancel/payment-cancel.component').then(
                (m) => m.PaymentCancelComponent
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
    ],
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
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
    ],
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
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/users/users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'sellers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/pages/sellers/sellers.component').then(
                (m) => m.AdminSellersComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/admin/pages/sellers/seller-detail/seller-detail.component').then(
                (m) => m.SellerDetailComponent
              ),
          },
        ],
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/pages/products/products.component').then(
            (m) => m.AdminProductsComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/pages/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/pages/orders/orders.component').then(
            (m) => m.AdminOrdersComponent
          ),
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/admin/pages/coupons/coupons.component').then(
            (m) => m.AdminCouponsComponent
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/admin/pages/reviews/reviews.component').then(
            (m) => m.AdminReviewsComponent
          ),
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./features/admin/pages/banners/banners.component').then(
            (m) => m.AdminBannersComponent
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
