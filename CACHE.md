# HTTP Caching Layer

This project implements a fully abstracted, non-breaking caching layer that integrates with the existing architecture.

## How it Works

The caching layer consists of two main components:

1. **CacheService**: A centralized service that manages an in-memory `Map` and `localStorage` persistence for specific data Types.
2. **CacheInterceptor**: A functional HTTP interceptor that intercepts `GET` requests, returns cached data if available and valid, and caches successful network responses.

## TTL (Time To Live)

| Data Type  | TTL        | Storage               |
| ---------- | ---------- | --------------------- |
| Categories | 10 minutes | Memory + localStorage |
| Banners    | 10 minutes | Memory + localStorage |
| Other GETs | 5 minutes  | Memory Only           |

## Invalidation Rules

Cache is automatically invalidated when a mutating request (`POST`, `PATCH`, `PUT`, `DELETE`) is made to related endpoints:

| Mutation Path     | Invalidated Prefixes        |
| ----------------- | --------------------------- |
| `/product`        | `product`                   |
| `/category`       | `category`                  |
| `/cart`           | `cart`                      |
| `/user/wishlist`  | `user/wishlist`             |
| `/order`          | `order`                     |
| `/review`         | `review`                    |
| `/seller`         | `seller`                    |
| `/admin/products` | `product`, `admin/products` |
| `/admin/orders`   | `order`, `admin/orders`     |
| `/admin/users`    | `admin/users`               |
| `/admin/banners`  | `admin/banners`             |

## Manual Cache Clearing

If you need to manually clear the cache from within the code, you can inject `CacheService` and call:

```typescript
// Clear all cache
this.cacheService.clear();

// Clear specific prefix
this.cacheService.clear('product');
```

## Constraints

- Only `GET` requests are cached.
- Requests with an `Authorization` header are only cached if they target specific safe endpoints (e.g., `/seller/profile`, `/admin/`). User-specific data like `cart`, `wishlist`, and `orders` are never cached when authenticated to ensure data integrity.
