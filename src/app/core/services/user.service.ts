import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, throwError, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { User } from '../models/auth.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
interface ProfileResponse {
  result: string;
  data: User;
}
export interface UpdateProfilePayload {
  userName?: string;
  phone?: string;
  addressId?: string;
  address?: {
    phone: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserApiResponse {
  message: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private storage = inject(StorageService);

  // PATCH /user/profile/update
  updateProfile(payload: UpdateProfilePayload): Observable<UserApiResponse> {
    return this.api
      .patch<UserApiResponse, UpdateProfilePayload>(`${API_ENDPOINTS.USER}/profile/update`, payload)
      .pipe(
        tap((res) => {
          const current = this.auth.currentUser();
          if (!current) return;

          // Always spread current user first so no fields go missing (role, email, etc.)
          // then override only with what the backend returned
          const updated: User = res?.user
            ? { ...current, ...res.user }
            : { ...current, userName: payload.userName ?? current.userName };

          this.auth.currentUser.set(updated);
          this.storage.setItem('user', updated);
        })
      );
  }

  // PATCH /user/profile/changePassword
  changePassword(payload: ChangePasswordPayload): Observable<UserApiResponse> {
    return this.api
      .patch<
        UserApiResponse,
        ChangePasswordPayload
      >(`${API_ENDPOINTS.USER}/profile/changePassword`, payload)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  // POST /user/profile/image  — multipart/form-data, field: "image"
  uploadProfileImage(file: File): Observable<ProfileResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.api
      .post<UserApiResponse, FormData>(`${API_ENDPOINTS.USER}/profile/image`, formData)
      .pipe(
        switchMap(() => this.getProfile()),
        tap((profileRes) => {
          const current = this.auth.currentUser();
          if (!current) return;
          const updated: User = { ...current, ...profileRes.data };
          this.auth.currentUser.set(updated);
          this.storage.setItem('user', updated);
        })
      );
  }

  getProfile(): Observable<ProfileResponse> {
    return this.api.get<ProfileResponse>(`${API_ENDPOINTS.USER}/profile`);
  }
}
