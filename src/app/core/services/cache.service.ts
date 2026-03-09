import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { StorageService } from './storage.service';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private storage = inject(StorageService);
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes in ms
  private readonly LS_PREFIX = 'cache__';

  set(key: string, data: unknown, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now() + ttl,
    };
    this.cache.set(key, entry);

    if (this.shouldPersist(key)) {
      // For localStorage, only store the body if it's an HttpResponse
      const persistentData = data instanceof HttpResponse ? data.body : data;
      this.storage.setItem(this.LS_PREFIX + key, {
        data: persistentData,
        timestamp: entry.timestamp,
      });
    }
  }

  get(key: string): unknown | null {
    // Check in-memory cache first
    let entry = this.cache.get(key);

    // If not in-memory, check localStorage for persistent keys
    if (!entry && this.shouldPersist(key)) {
      const stored = this.storage.getItem<CacheEntry>(this.LS_PREFIX + key);
      if (stored) {
        if (Date.now() > stored.timestamp) {
          this.storage.removeItem(this.LS_PREFIX + key);
          return null;
        }
        entry = stored;
        // Backfill in-memory cache
        this.cache.set(key, entry);
      }
    }

    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    // Also remove from localStorage if it's there
    this.storage.removeItem(this.LS_PREFIX + key);
  }

  clear(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      this.clearStorageWithPrefix(this.LS_PREFIX);
    } else {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes(prefix)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.delete(key));

      // Also clear from storage if matching prefix
      this.clearStorageWithPrefix(this.LS_PREFIX + prefix);
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  private shouldPersist(key: string): boolean {
    const persistentPrefixes = ['category', 'banner'];
    return persistentPrefixes.some((p) => key.includes(p));
  }

  private clearStorageWithPrefix(prefix: string): void {
    // We iterate over localStorage to find keys with our prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => this.storage.removeItem(k));
  }
}
