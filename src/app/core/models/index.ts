// ─────────────────────────────────────────────────────────────────────────────
// index.ts — Models Barrel File
//
// This file re-exports everything from every model file in one place.
// It is called a "barrel" file because it collects and re-exports exports
// like a barrel collecting items.
//
// WHY THIS MATTERS:
// Without this file, every service and component would need to write:
//   import { Product } from '../../core/models/product.model';
//   import { User }    from '../../core/models/auth.model';
//   import { Cart }    from '../../core/models/cart.model';
//
// With this barrel file, they write one clean line:
//   import { Product, User, Cart } from '../../core/models';
//
// This also means if you ever rename or reorganize a model file,
// you only change the import in this barrel — not in every service.
// ─────────────────────────────────────────────────────────────────────────────

// Shared base types — export first because other models depend on them
export * from './shared.model';

// Domain models — alphabetical order for easy scanning
export * from './admin.model';
export * from './auth.model';
export * from './banner.model';
export * from './cart.model';
export * from './category.model';
export * from './order.model';
export * from './payment.model';
export * from './product.model';
export * from './review.model';
export * from './seller.model';
