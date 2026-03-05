// ─────────────────────────────────────────────────────────────────────────────
// auth.model.ts
//
// Covers: User registration, login, and the authenticated user's identity.
// Used by: AuthService, StorageService, all Route Guards, the Header component,
//          and the error interceptor (which reads the user's role on 401).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three roles in this application.
 * Using a union type (string literal type) means TypeScript will give you
 * an error if you ever accidentally write role === 'superadmin' or any
 * value that doesn't exist in the system.
 *
 * 'customer' → regular shopper, can add to cart, place orders, write reviews
 * 'seller'   → can create and manage their own product listings
 * 'admin'    → full platform control: users, all products, orders, banners
 */
export type UserRole = 'customer' | 'seller' | 'admin';

/**
 * The core User object.
 * This is what the backend stores and what we cache in localStorage after login.
 * Every guard, every role-based UI element, and AuthService itself reads from
 * this shape — so changing a field name here requires updating those dependents.
 *
 * Note: we store this in localStorage via StorageService, so every field here
 * must be JSON-serializable (no Date objects, no functions).
 */
export interface User {
  _id: string;

  // The display name shown in the header and on reviews
  userName: string;

  email: string;

  // The role determines what routes, buttons, and API calls the user can access.
  // Read this via AuthService.isAdmin() / isSeller() computed signals —
  // never read it directly from localStorage in a component.
  role: UserRole;

  // When true, the user has been restricted by an admin.
  // The backend will reject their requests, but the frontend can also
  // use this to show a "Your account is suspended" message.
  isBlocked: boolean;

  // Seller-specific fields — only populated when role === 'seller'.
  // Optional because customer and admin users do not have a store.
  storeName?: string;
  storeDescription?: string;
  phone?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────
// These describe the shape of data we SEND to the backend, not what we receive.

/**
 * The body sent to POST /auth/login.
 * Used by the login form's submit handler and AuthService.login().
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * The body sent to POST /auth/register.
 * confirmPassword is a frontend-only validation field — the backend
 * does not need it. The form validates both fields match, then sends
 * only the fields below to the API.
 */
export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Response Shapes ──────────────────────────────────────────────────────────
// These describe the shape of data we RECEIVE from the backend.

/**
 * The response from POST /auth/login and POST /auth/register.
 * After a successful login, AuthService stores the token via StorageService
 * and sets the currentUser signal to the user object.
 */
export interface AuthResponse {
  message: string;

  // The JWT — stored in localStorage and attached to every protected request
  // by the auth interceptor. Never log this or expose it to the template.
  token: string;

  // The full user object — cached in localStorage so the user stays
  // "logged in" across page refreshes without needing a new login call.
  user: User;
}
