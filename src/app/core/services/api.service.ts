import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }
  post<T, B extends object>(endpoint: string, body: B): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
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
