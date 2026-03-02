import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoading should be false initially', () => {
    expect(service.loading()).toBeFalse();
  });

  it('isLoading should be true after one show() call', () => {
    service.show();
    expect(service.loading()).toBeTrue();
  });

  it('isLoading should remain true when show() called twice and hide() called once', () => {
    service.show();
    service.show();
    service.hide();
    expect(service.loading()).toBeTrue();
  });

  it('isLoading should be false after show() and hide() both called once', () => {
    service.show();
    service.hide();
    expect(service.loading()).toBeFalse();
  });

  it('hide() should never decrement below 0 and isLoading should be false', () => {
    service.hide();
    expect(service.loading()).toBeFalse();
    // Verify it doesn't get stuck if we call show() later
    service.show();
    expect(service.loading()).toBeTrue();
    service.hide();
    expect(service.loading()).toBeFalse();
  });
});
