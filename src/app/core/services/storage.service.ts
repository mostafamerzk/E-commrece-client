import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setItem(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
