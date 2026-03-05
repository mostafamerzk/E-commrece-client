# Project Tasks

> Last updated: 2026-02-28
> Current phase: 0 — Setup
> Legend: [ ] Not started | [~] In progress | [x] Done | [!] Blocked

---

## FATHI — Cart & Products

### [TASK-F01] Base HTTP Infrastructure
**Status:** [x]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/services/api.service.ts
- src/app/core/constants/api-endpoints.ts
**Definition of done:** ApiService wraps HttpClient. All three interceptors registered in app.config.ts. A test GET call to a public endpoint returns data correctly.
**Unit tests required:**
- Should call the correct full URL (baseUrl + endpoint)
- Should pass query params as HttpParams
- Should handle and re-throw errors via catchError

---

### [TASK-F02] All Three HTTP Interceptors
**Status:** [x]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/interceptors/auth.interceptor.ts
- src/app/core/interceptors/error.interceptor.ts
- src/app/core/interceptors/loading.interceptor.ts
**Definition of done:** Auth interceptor attaches Bearer token. Error interceptor redirects on 401. Loading interceptor shows/hides spinner.
**Unit tests required:**
- Auth: Should add Authorization header when token exists
- Auth: Should pass request unchanged when no token
- Error: Should call AuthService.logout() on 401
- Error: Should show toast on 500
- Loading: Should call LoadingService.show() before request
- Loading: Should call LoadingService.hide() after response (success and error)

---

### [TASK-F03] Product Service
**Status:** [ ]
**Phase:** 1 — Core Services
**Files to create:**
- src/app/core/services/product.service.ts
- src/app/core/models/product.model.ts
**Definition of done:** All five product API methods implemented and typed. Uses API_ENDPOINTS constants.
**Unit tests required:**
- getAll() should call GET /product with correct query params
- getById(id) should call GET /product/:id
- create() should call POST /product with FormData
- update() should call PATCH /product/:id
- delete() should call DELETE /product/:id

---

### [TASK-F04] Product Listing Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/products/pages/product-list/product-list.component.ts
- src/app/features/products/pages/product-list/product-list.component.html
- src/app/features/products/pages/product-list/product-list.component.scss
**Definition of done:** Displays paginated product grid. Search, category filter, price range filter, and sort all function correctly against the real API.
**Unit tests required:**
- Should display loading spinner while fetching
- Should render correct number of product cards when data loads
- Should call getAll() with updated params when search input changes
- Should display empty state component when products array is empty
- Should update page number when pagination is used

---

### [TASK-F05] Product Card Component
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/shared/components/product-card/product-card.component.ts
- src/app/shared/components/product-card/product-card.component.html
- src/app/shared/components/product-card/product-card.component.scss
**Definition of done:** Accepts Product input. Displays discounted price with pipe. Shows out-of-stock badge when stock is 0. Wishlist heart icon toggles correctly.
**Unit tests required:**
- Should display finalPrice using discountPrice pipe
- Should show out-of-stock badge when product.stock === 0
- Should emit addToCart event when button is clicked
- Should emit toggleWishlist event when heart icon is clicked
- Should navigate to product detail on card click

---

### [TASK-F06] Product Detail Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/products/pages/product-detail/product-detail.component.ts
- src/app/features/products/pages/product-detail/product-detail.component.html
**Definition of done:** Full product info, PrimeNG Galleria for images, stock status, quantity selector, reviews section all render correctly.
**Unit tests required:**
- Should call getById() with id from route params
- Should display 404 state when product not found (API returns 404)
- Should disable add-to-cart button when stock is 0
- Should render reviews section (can be empty)

---

### [TASK-F07] Cart Service
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/core/services/cart.service.ts
- src/app/core/models/cart.model.ts
**Definition of done:** All five cart API methods implemented. Cart item count exposed as computed signal. Count updates reactively on add/remove.
**Unit tests required:**
- addItem() should call POST /cart
- removeItem() should call DELETE /cart/:productId
- clearCart() should call DELETE /cart
- itemCount signal should return correct count
- itemCount should update when cart state changes

---

### [TASK-F08] Cart Page UI
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/cart/pages/cart/cart.component.ts
- src/app/features/cart/pages/cart/cart.component.html
**Definition of done:** Displays all cart items. Quantity increment/decrement buttons work. Remove button removes item. Total price recalculates. Empty cart state shown when cart is empty.
**Unit tests required:**
- Should display all items from CartService
- Should call updateQuantity() when +/- clicked
- Should call removeItem() when delete is clicked
- Should display empty state when cart is empty
- Should display correct total price

---

## MOSTAFA — Orders, Checkout & Categories

### [TASK-M01] StorageService + AuthService
**Status:** [ ]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/services/storage.service.ts
- src/app/core/services/auth.service.ts
- src/app/core/models/auth.model.ts
**Definition of done:** StorageService wraps localStorage with typed methods. AuthService has currentUser signal, isLoggedIn computed, login(), logout(). After login, token is in localStorage and signal is set. After logout, storage is cleared and signal is null.
**Unit tests required:**
- StorageService: set() should serialize value to JSON
- StorageService: get() should deserialize and return typed value
- StorageService: get() should return null for missing key
- AuthService: login() should store token and set currentUser signal
- AuthService: logout() should clear storage and set signal to null
- AuthService: isLoggedIn() should be false initially if no stored user
- AuthService: isAdmin() should return true only when role is 'admin'

---

### [TASK-M02] LoadingService + ToastService
**Status:** [ ]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/services/loading.service.ts
- src/app/core/services/toast.service.ts
**Definition of done:** LoadingService counter correctly handles concurrent requests. isLoading is false only when all requests are complete. ToastService wraps PrimeNG MessageService.
**Unit tests required:**
- LoadingService: isLoading should be false initially
- LoadingService: isLoading should be true after one show() call
- LoadingService: isLoading should remain true when show() called twice and hide() called once
- LoadingService: isLoading should be false after show() and hide() both called once
- LoadingService: hide() should never decrement below 0

---

### [TASK-M03] Category Service & Management (Admin)
**Status:** [x]
**Phase:** 1 — Core Services
**Files to create:**
- src/app/core/services/category.service.ts
- src/app/core/models/category.model.ts
- src/app/features/admin/pages/categories/categories.component.ts
**Definition of done:** All five category API methods implemented. Admin category management page shows table of categories with create, edit, delete actions.
**Unit tests required:**
- getAll() should call GET /category
- create() should call POST /category with FormData
- update() should call PATCH /category/:id
- delete() should call DELETE /category/:id
- Admin page: Should open create dialog on button click
- Admin page: Should call delete() with correct id when delete is confirmed

---

### [TASK-M04] Order Service
**Status:** [ ]
**Phase:** 1 — Core Services
**Files to create:**
- src/app/core/services/order.service.ts
- src/app/core/models/order.model.ts
**Definition of done:** All five order API methods implemented and typed. checkout() correctly returns the price summary.
**Unit tests required:**
- checkout() should call POST /order/checkout
- placeOrder() should call POST /order with correct payload
- getUserOrders() should call GET /order
- getById() should call GET /order/:id
- cancelOrder() should call PATCH /order/:id/cancel

---

### [TASK-M05] Checkout Summary Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/orders/pages/checkout/checkout.component.ts
- src/app/features/orders/pages/checkout/checkout.component.html
**Definition of done:** Calls POST /order/checkout and displays subtotal, shipping, discount, and total. Coupon code field applies discount when valid code is entered.
**Unit tests required:**
- Should call OrderService.checkout() on init
- Should display all price breakdown fields
- Should apply coupon code when form is submitted
- Should show error message when coupon code is invalid

---

### [TASK-M06] Place Order Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/orders/pages/place-order/place-order.component.ts
- src/app/features/orders/pages/place-order/place-order.component.html
**Definition of done:** Shipping address form with validation. Payment method radio buttons. On submit, calls placeOrder() and navigates to order confirmation.
**Unit tests required:**
- Should be invalid when required address fields are empty
- Should call placeOrder() with correct payload on valid form submit
- Should navigate to order confirmation on success
- Should show toast error if order fails

---

### [TASK-M07] Order History + Single Order Pages
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/orders/pages/order-list/order-list.component.ts
- src/app/features/orders/pages/order-detail/order-detail.component.ts
**Definition of done:** Order list shows all past orders with status badges. Single order shows full details and a cancel button when status allows cancellation.
**Unit tests required:**
- Order list: Should call getUserOrders() on init
- Order list: Should display correct status badge color per status
- Order detail: Should call getById() with route param id
- Order detail: Should show cancel button when status is 'pending' or 'confirmed'
- Order detail: Should hide cancel button for other statuses
- Cancel: Should call cancelOrder() and update displayed status on success

---

### [TASK-M08] Stripe Payment Integration
**Status:** [ ]
**Phase:** 3 — Integrations
**Files to create:**
- src/app/core/services/payment.service.ts
- src/app/features/orders/pages/payment-success/payment-success.component.ts
- src/app/features/orders/pages/payment-cancel/payment-cancel.component.ts
**Definition of done:** PaymentService calls POST /payment/create-checkout-session and window.location.href redirects to Stripe URL. Success and cancel pages render appropriate messages.
**Unit tests required:**
- createCheckoutSession() should call POST /payment/create-checkout-session with orderId
- Should redirect to returned Stripe URL
- Success page: Should display confirmation message
- Cancel page: Should display retry option

---

## ISSAC — Reviews & Admin Panel

### [TASK-I01] Route Guards
**Status:** [ ]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/guards/auth.guard.ts (authGuard, adminGuard, sellerGuard, guestGuard)
**Definition of done:** authGuard redirects to /auth/login when not logged in. adminGuard redirects to / when not admin. guestGuard redirects to / when already logged in.
**Unit tests required:**
- authGuard: Should return true when user is logged in
- authGuard: Should redirect to /auth/login when not logged in
- adminGuard: Should return true when user role is 'admin'
- adminGuard: Should redirect to / when role is not 'admin'
- guestGuard: Should return true when user is NOT logged in
- guestGuard: Should redirect to / when user IS logged in

---

### [TASK-I02] TypeScript Model Files
**Status:** [x]
**Phase:** 0 — Setup
**Files to create:**
- src/app/core/models/auth.model.ts
- src/app/core/models/product.model.ts
- src/app/core/models/order.model.ts
- src/app/core/models/cart.model.ts
- src/app/core/models/review.model.ts
- src/app/core/models/category.model.ts
- src/app/core/models/banner.model.ts
**Definition of done:** Every interface matches the API contract response shapes exactly. All interfaces are exported.
**Unit tests required:** (Models are interfaces — they do not require runtime tests. TypeScript compilation itself is the test. Ensure the project compiles with zero type errors: `ng build` passes.)

---

### [TASK-I03] Review Service
**Status:** [x]
**Phase:** 1 — Core Services
**Files to create:**
- src/app/core/services/review.service.ts
**Definition of done:** All four review API methods implemented.
**Unit tests required:**
- addReview() should call POST /review/:productId
- getProductReviews() should call GET /review/:productId
- updateReview() should call PATCH /review/:reviewId
- deleteReview() should call DELETE /review/:reviewId

---

### [TASK-I04] Reviews Section Component
**Status:** [~]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/shared/components/reviews-section/reviews-section.component.ts
- src/app/shared/components/reviews-section/reviews-section.component.html
**Definition of done:** Displays paginated reviews. Add review form visible only to authenticated users. Edit and delete buttons visible only on the user's own reviews.
**Unit tests required:**
- Should call getProductReviews() with productId input
- Should show add-review form when user isLoggedIn() is true
- Should hide add-review form when user is not logged in
- Should show edit/delete buttons only for reviews owned by currentUser
- Should call addReview() on form submit with correct payload
- Add review form: Should be invalid when rating is missing

---
### [TASK-K07] Login & Register Pages
**Status:** [x]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/auth/pages/login/login.component.ts
- src/app/features/auth/pages/login/login.component.html
- src/app/features/auth/pages/register/register.component.ts
- src/app/features/auth/pages/register/register.component.html
**Definition of done:** Reactive forms with full validation. Login calls AuthService.login() and redirects to home. Register calls the register API. Form errors display inline.
**Unit tests required:**
- Login form: Should be invalid when email or password is empty
- Login form: Should be invalid with malformed email format
- Login: Should call AuthService.login() with form values on submit
- Login: Should navigate to / on success
- Login: Should display error message on failed login
- Register form: Should be invalid when passwords do not match
- Register form: Should require all mandatory fields

---

### [TASK-I05] Admin Layout + Dashboard
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/layouts/admin-layout/admin-layout.component.ts
- src/app/layouts/admin-layout/admin-layout.component.html
- src/app/features/admin/pages/dashboard/dashboard.component.ts
**Definition of done:** Admin layout renders sidebar nav + router-outlet. All admin routes are children of admin-layout. Dashboard shows placeholder stat cards.
**Unit tests required:**
- Admin layout: Should render router-outlet
- Admin layout: Should show sidebar navigation with all links
- Dashboard: Should render without errors

---

### [TASK-I06] Admin User Management Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/admin/pages/users/admin-users.component.ts
- src/app/features/admin/pages/users/admin-users.component.html
- src/app/core/services/admin.service.ts (user-related methods)
**Definition of done:** PrimeNG DataTable lists all users with search. Restrict and Approve buttons change user status. Blocked users are visually distinct.
**Unit tests required:**
- Should call AdminService.getAllUsers() on init
- Should filter table when search input changes
- Should call restrictUser() and update user status in table
- Should call approveUser() and update user status in table
- Should show confirmation dialog before restricting a user

---

### [TASK-I07] Admin Order Management Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/admin/pages/orders/admin-orders.component.ts
- src/app/features/admin/pages/orders/admin-orders.component.html
**Definition of done:** DataTable shows all orders with filters for status and payment. Inline status dropdown allows admin to update order status.
**Unit tests required:**
- Should call AdminService.getAllOrders() on init
- Should filter orders when status filter changes
- Should call updateOrderStatus() with new status when dropdown changes
- Should display updated status immediately after successful update

---

### [TASK-I08] Admin Banner Management Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/admin/pages/banners/admin-banners.component.ts
**Definition of done:** Full CRUD for banners with image upload. Activate/deactivate toggle. Active banners show visual indicator.
**Unit tests required:**
- Should load all banners on init
- Should call createBanner() with FormData on form submit
- Should call deleteBanner() after delete confirmation
- Should toggle isActive status when activate button clicked
- Create form: Should be invalid when title, link, or image are missing

---

## MOKHTAR — Wishlist & Seller Dashboard

### [TASK-K01] App Routing Configuration
**Status:** [x]
**Phase:** 0 — Setup
**Files to create:**
- src/app/app.routes.ts
**Definition of done:** All routes defined with lazy loading. Guards applied to correct routes. Admin routes nested under admin-layout. Auth routes nested under auth-layout.
**Routes to define:**
  - / → HomeComponent (lazy)
  - /auth/login → LoginComponent (lazy) | guestGuard
  - /auth/register → RegisterComponent (lazy) | guestGuard
  - /products → ProductListComponent (lazy) | public
  - /products/:id → ProductDetailComponent (lazy) | public
  - /cart → CartComponent (lazy) | authGuard
  - /orders → OrderListComponent (lazy) | authGuard
  - /orders/:id → OrderDetailComponent (lazy) | authGuard
  - /wishlist → WishlistComponent (lazy) | authGuard
  - /seller → SellerDashboard (lazy) | authGuard + sellerGuard
  - /admin → AdminLayout children (lazy) | authGuard + adminGuard
  - ** → NotFoundComponent
**Unit tests required:**
- Should lazy-load product feature module
- authGuard should be applied to /cart route
- adminGuard should be applied to /admin route
- Unknown route should redirect to 404

---

### [TASK-K02] Main Layout Component (Header + Footer)
**Status:** [ ]
**Phase:** 1 — Layouts
**Files to create:**
- src/app/layouts/main-layout/main-layout.component.ts
- src/app/layouts/main-layout/main-layout.component.html
- src/app/layouts/main-layout/main-layout.component.scss
**Definition of done:** Header shows logo, nav links, cart badge (CartService signal), wishlist icon, and user menu (logged in: profile/logout, logged out: login/register). Footer renders. Router outlet renders content.
**Unit tests required:**
- Should show cart item count from CartService.itemCount signal
- Should show Login/Register links when isLoggedIn() is false
- Should show user name and logout option when isLoggedIn() is true
- Should navigate to /auth/login when logout is called

---

### [TASK-K03] Wishlist Service
**Status:** [ ]
**Phase:** 1 — Core Services
**Files to create:**
- src/app/core/services/wishlist.service.ts
**Definition of done:** Three wishlist API methods. wishlistIds exposed as signal (array of product IDs). isInWishlist(id) computed helper. Product card uses this to show correct heart icon state.
**Unit tests required:**
- getWishlist() should call GET /user/wishlist
- addToWishlist() should call POST /user/wishlist/:productId
- removeFromWishlist() should call DELETE /user/wishlist/:productId
- isInWishlist() should return true when productId is in wishlist signal
- isInWishlist() should return false when productId is not in signal

---

### [TASK-K04] Wishlist Page
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/wishlist/pages/wishlist/wishlist.component.ts
- src/app/features/wishlist/pages/wishlist/wishlist.component.html
**Definition of done:** Displays all wishlisted products using ProductCardComponent. Remove from wishlist works. Add to cart from wishlist works. Empty state shown when wishlist is empty.
**Unit tests required:**
- Should call WishlistService.getWishlist() on init
- Should display empty state when wishlist is empty
- Should call removeFromWishlist() when remove is triggered from card
- Should call CartService.addItem() when add-to-cart is triggered from card

---

### [TASK-K05] Seller Profile & Products Pages
**Status:** [ ]
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/core/services/seller.service.ts
- src/app/features/seller/pages/profile/seller-profile.component.ts
- src/app/features/seller/pages/products/seller-products.component.ts
- src/app/features/seller/pages/inventory/seller-inventory.component.ts
**Definition of done:** Profile form with store name, description, phone, image upload. Products table shows only the seller's own products. Inventory shows stock and sold figures.
**Unit tests required:**
- SellerService.getProfile() should call GET /seller/profile
- SellerService.updateProfile() should call PATCH /seller/profile
- Products page: Should call getSellerProducts() on init
- Inventory page: Should highlight rows where stock < 10

---

### [TASK-K06] Shared Utility Components
**Status:** [ ]
**Phase:** 1 — Shared Components
**Files to create:**
- src/app/shared/components/spinner/spinner.component.ts
- src/app/shared/components/empty-state/empty-state.component.ts
- src/app/shared/pipes/discount-price.pipe.ts
- src/app/shared/pipes/truncate.pipe.ts
**Definition of done:** Spinner reads LoadingService.isLoading signal and shows/hides overlay. EmptyState accepts title and message inputs. Both pipes are tested and exported from SharedModule.
**Unit tests required:**
- Spinner: Should be visible when isLoading() is true
- Spinner: Should be hidden when isLoading() is false
- EmptyState: Should render passed title and message inputs
- DiscountPricePipe: transform(1000, 10) should return 900
- DiscountPricePipe: transform(1000, 0) should return 1000 unchanged
- DiscountPricePipe: transform(1000) should return 1000 when no discount
- TruncatePipe: Should truncate text longer than specified length
- TruncatePipe: Should not truncate text shorter than specified length

---


## SHARED TASKS (All team members)

### [TASK-S01] Homepage
**Status:** [ ]
**Assigned to:** Mokhtar (lead) + Fathi (product section)
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/home/pages/home/home.component.ts
- src/app/features/home/pages/home/home.component.html
**Definition of done:** PrimeNG Carousel shows active banners. Featured categories grid. New arrivals product section (latest 8 products). All data from real API.
**Unit tests required:**
- Should call AdminService.getBanners() filtered by isActive: true
- Should call CategoryService.getAll()
- Should call ProductService.getAll() with sort: '-createdAt', limit: '8'
- Should render carousel only when banners array is not empty

---

### [TASK-S02] 404 Page + Error Boundaries
**Status:** [ ]
**Assigned to:** Issac
**Phase:** 2 — Feature Pages
**Files to create:**
- src/app/features/not-found/not-found.component.ts
**Definition of done:** Friendly 404 page with navigation back to home. Applied to ** route.
**Unit tests required:**
- Should render a link that navigates to /
