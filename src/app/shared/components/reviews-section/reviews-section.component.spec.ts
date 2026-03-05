/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsSectionComponent } from './reviews-section.component';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import { Review } from '../../../core/models/review.model';
import { User } from '../../../core/models/auth.model';

describe('ReviewsSectionComponent', () => {
  let component: ReviewsSectionComponent;
  let fixture: ComponentFixture<ReviewsSectionComponent>;
  let reviewServiceSpy: jasmine.SpyObj<ReviewService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  const mockUser: User = {
    _id: 'u1',
    userName: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    isBlocked: false,
  };
  const mockReview: Review = {
    _id: 'r1',
    productId: 'p1',
    userId: 'u1',
    user: { _id: 'u1', userName: 'John Doe' },
    rating: 5,
    comment: 'Great product!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    reviewServiceSpy = jasmine.createSpyObj('ReviewService', [
      'getProductReviews',
      'addReview',
      'deleteReview',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoggedIn: signal(false),
      currentUser: signal<User | null>(null),
      isAdmin: signal(false),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [ReviewsSectionComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReviewService, useValue: reviewServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        // Global provider just in case, but component overrides it
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
      ],
    })
      .overrideComponent(ReviewsSectionComponent, {
        add: {
          providers: [{ provide: ConfirmationService, useValue: confirmationServiceSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReviewsSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productId', 'p1');

    reviewServiceSpy.getProductReviews.and.returnValue(
      of({ reviews: [mockReview], message: 'Success', pagination: {} as any })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reviews on init', () => {
    fixture.detectChanges();
    expect(reviewServiceSpy.getProductReviews).toHaveBeenCalledWith('p1');
    expect(component.reviews()).toEqual([mockReview]);
  });

  describe('Write Review Form Visibility', () => {
    it('should hide form when logged out', () => {
      (authServiceSpy.isLoggedIn as any).set(false);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeFalsy();
      expect(compiled.textContent).toContain('log in');
    });

    it('should show form when logged in', () => {
      (authServiceSpy.isLoggedIn as any).set(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('form')).toBeTruthy();
    });
  });

  describe('Submit Review', () => {
    beforeEach(() => {
      (authServiceSpy.isLoggedIn as any).set(true);
      fixture.detectChanges();
    });

    it('should not call addReview if form is invalid', () => {
      component.reviewForm.patchValue({ rating: null, comment: '' });
      component.submitReview();
      expect(reviewServiceSpy.addReview).not.toHaveBeenCalled();
    });

    it('should call addReview on valid form submit', () => {
      component.reviewForm.patchValue({ rating: 5, comment: 'This is a very good product!' });
      const newReview: Review = {
        ...mockReview,
        _id: 'r2',
        comment: 'This is a very good product!',
      };
      reviewServiceSpy.addReview.and.returnValue(of({ review: newReview, message: 'Success' }));

      component.submitReview();

      expect(reviewServiceSpy.addReview).toHaveBeenCalledWith('p1', {
        rating: 5,
        comment: 'This is a very good product!',
      });
      expect(toastServiceSpy.success).toHaveBeenCalled();
      expect(component.reviews()).toContain(newReview);
    });
  });

  describe('Delete Review', () => {
    it('should show delete button only for owner', () => {
      (authServiceSpy.currentUser as any).set(mockUser);
      fixture.detectChanges();

      expect(component.canDelete(mockReview)).toBeTrue();

      const otherReview: Review = {
        ...mockReview,
        userId: 'u2',
        user: { _id: 'u2', userName: 'Other' },
      };
      expect(component.canDelete(otherReview)).toBeFalse();
    });

    it('should allow admin to delete any review', () => {
      (authServiceSpy.currentUser as any).set(mockUser);
      (authServiceSpy.isAdmin as any).set(true);
      fixture.detectChanges();

      const otherReview: Review = {
        ...mockReview,
        userId: 'u2',
        user: { _id: 'u2', userName: 'Other' },
      };
      expect(component.canDelete(otherReview)).toBeTrue();
    });

    it('should call deleteReview after confirmation', () => {
      reviewServiceSpy.deleteReview.and.returnValue(of({ message: 'Deleted' }));
      component.confirmDelete('r1');

      // Trigger the accept callback
      const args = confirmationServiceSpy.confirm.calls.mostRecent().args[0];
      if (args.accept) args.accept();

      expect(reviewServiceSpy.deleteReview).toHaveBeenCalledWith('r1');
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Review deleted');
    });
  });
});
