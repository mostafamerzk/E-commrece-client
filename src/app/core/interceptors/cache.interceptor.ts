import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';

/**
 * CacheInterceptor handles HTTP GET caching and automatic invalidation on mutations.
 * It integrates with CacheService for in-memory and localStorage persistence.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // 1. Only cache GET requests
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap((event) => {
        // If mutation is successful (POST, PUT, PATCH, DELETE), invalidate related cache
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          invalidateCache(req.url, cacheService);
        }
      })
    );
  }

  // 2. Do not cache user-specific mutable data with Authorization header
  if (req.headers.has('Authorization')) {
    const isCacheableAuthenticated =
      req.url.includes('/seller/profile') ||
      req.url.includes('/admin/') ||
      req.url.includes('/banner') ||
      req.url.includes('/category');

    if (!isCacheableAuthenticated) {
      return next(req);
    }
  }

  // 3. Check for cached response in CacheService (memory or localStorage)
  const cachedData = cacheService.get(req.urlWithParams);
  if (cachedData) {
    if (cachedData instanceof HttpResponse) {
      return of(cachedData.clone());
    }
    // Reconstruct HttpResponse if only body was stored (e.g. from localStorage)
    return of(
      new HttpResponse({
        body: cachedData,
        status: 200,
        statusText: 'OK',
        url: req.urlWithParams,
      })
    );
  }

  // 4. Forward to network and cache the response if successful
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
        const ttl = getTTL(req.url);
        cacheService.set(req.urlWithParams, event.clone(), ttl);
      }
    })
  );
};

/**
 * Determines TTL based on URL patterns.
 * Categories and banners are considered static and get 10 minutes.
 * Others get 5 minutes default.
 */
function getTTL(url: string): number {
  if (url.includes('/category') || url.includes('/banner')) {
    return 600000; // 10 minutes
  }
  return 300000; // 5 minutes
}

/**
 * Invalidates related cache prefixes based on the mutation URL.
 */
function invalidateCache(url: string, cacheService: CacheService) {
  const invalidationMap: Record<string, string[]> = {
    '/product': ['product'],
    '/category': ['category'],
    '/cart': ['cart'],
    '/user/wishlist': ['user/wishlist'],
    '/order': ['order'],
    '/review': ['review'],
    '/seller': ['seller'],
    '/admin/products': ['product', 'admin/products'],
    '/admin/orders': ['order', 'admin/orders'],
    '/admin/users': ['admin/users'],
    '/admin/banners': ['admin/banners'],
  };

  for (const [path, prefixes] of Object.entries(invalidationMap)) {
    if (url.includes(path)) {
      prefixes.forEach((prefix) => cacheService.clear(prefix));
    }
  }
}
