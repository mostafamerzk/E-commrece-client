import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(StorageService);
    localStorage.clear();
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();
    spyOn(localStorage, 'clear').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem', () => {
    it('should serialize and store value in localStorage', () => {
      const data = { id: 1, name: 'Test' };
      service.setItem('test-key', data);
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(data));
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify(data));
    });
  });

  describe('getItem', () => {
    it('should return null when key does not exist', () => {
      const result = service.getItem('missing-key');
      expect(result).toBeNull();
    });

    it('should deserialize and return typed value when key exists', () => {
      const data = { id: 1, name: 'Test' };
      localStorage.setItem('user', JSON.stringify(data));
      const result = service.getItem<{ id: number; name: string }>('user');
      expect(result).toEqual(data);
    });

    it('should return raw string if JSON.parse fails', () => {
      localStorage.setItem('no-json', 'raw-string');
      const result = service.getItem<string>('no-json');
      expect(result).toBe('raw-string');
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test-key', 'value');
      service.removeItem('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('k1', 'v1');
      localStorage.setItem('k2', 'v2');
      service.clear();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(localStorage.length).toBe(0);
    });
  });
});
