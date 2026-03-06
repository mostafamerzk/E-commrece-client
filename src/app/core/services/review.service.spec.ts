import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { ReviewService } from './review.service';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  AddReviewPayload,
  UpdateReviewPayload,
  ReviewResponse,
  ReviewsResponse,
} from '../models/review.model';

describe('ReviewService', () => {
  let service: ReviewService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'patch', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ReviewService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(ReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addReview', () => {
    it('should call apiService.post with correct endpoint and payload', () => {
      const productId = 'prod123';
      const payload: AddReviewPayload = { rating: 5, comment: 'Great product!' };
      const mockResponse: ReviewResponse = {
        message: 'Success',
        review: {
          _id: 'rev1',
          rating: 5,
          comment: 'Great product!',
          userId: 'u1',
          productId,
          createdAt: new Date().toISOString(),
          user: { _id: 'u1', userName: 'test' },
        },
      };

      apiSpy.post.and.returnValue(of(mockResponse));

      service.addReview(productId, payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.post).toHaveBeenCalledWith(`${API_ENDPOINTS.REVIEWS}/${productId}`, payload);
      });
    });
  });

  describe('getProductReviews', () => {
    it('should call apiService.get with correct endpoint and params', () => {
      const productId = 'prod123';
      const params = { page: 1, limit: 10 };
      const mockResponse: ReviewsResponse = {
        message: 'Success',
        reviews: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          totalPages: 1,
        },
      };

      apiSpy.get.and.returnValue(of(mockResponse));

      service.getProductReviews(productId, params).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.get).toHaveBeenCalledWith(`${API_ENDPOINTS.REVIEWS}/${productId}`, params);
      });
    });
  });

  describe('updateReview', () => {
    it('should call apiService.patch with correct endpoint and payload', () => {
      const reviewId = 'rev123';
      const payload: UpdateReviewPayload = { rating: 4 };
      const mockResponse: ReviewResponse = {
        message: 'Updated',
        review: {
          _id: reviewId,
          rating: 4,
          comment: 'Ok',
          userId: 'u1',
          productId: 'p1',
          createdAt: new Date().toISOString(),
          user: { _id: 'u1', userName: 'test' },
        },
      };

      apiSpy.patch.and.returnValue(of(mockResponse));

      service.updateReview(reviewId, payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.patch).toHaveBeenCalledWith(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, payload);
      });
    });
  });

  describe('deleteReview', () => {
    it('should call apiService.delete with correct endpoint', () => {
      const reviewId = 'rev123';
      const mockResponse = { message: 'Deleted' };

      apiSpy.delete.and.returnValue(of(mockResponse));

      service.deleteReview(reviewId).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(apiSpy.delete).toHaveBeenCalledWith(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
      });
    });
  });
});
