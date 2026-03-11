import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl.endsWith('/')
    ? environment.apiUrl.slice(0, -1)
    : environment.apiUrl;

  private http = inject(HttpClient);

  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const url = endpoint.startsWith('/')
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.http.get<T>(url, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }
  post<T, B extends object>(endpoint: string, body: B): Observable<T> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log('[ApiService] 🌐 POST Full URL:', fullUrl);
    console.log('[ApiService] 🌐 POST Body:', body);
    return this.http.post<T>(fullUrl, body).pipe(
      catchError((err) => {
        console.error('[ApiService] 🌐 POST Error:', err);
        return throwError(() => err);
      })
    );
  }

  patch<T, B extends object>(endpoint: string, body?: B): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((err) => throwError(() => err)));
  }

  put<T, B extends object>(endpoint: string, body: B): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError((err) => throwError(() => err)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
