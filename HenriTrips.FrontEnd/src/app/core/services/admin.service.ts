// src/app/core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserDto } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private tokenKey = 'access_token';

  private currentUserSignal = signal<UserDto | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            this.loadStoredUser();
          }
        }),
        catchError(this.handleError)
      );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const user = this.currentUserSignal();
    return user?.roles?.includes('Admin') ?? false;
  }

  getUserId(): string | null {
    return this.currentUserSignal()?.id ?? null;
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      this.currentUserSignal.set(user);
    } else if (token) {
      this.logout();
    }
  }

  private decodeToken(token: string): UserDto | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.nameid,
        email: payload.email,
        userName: payload.unique_name || payload.name,
        roles: Array.isArray(payload.role) ? payload.role : [payload.role]
      };
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  private handleError(error: any): Observable<never> {
    let message = 'An error occurred';
    if (error.error?.message) message = error.error.message;
    else if (error.status === 401) message = 'Invalid email or password';
    else if (error.status === 0) message = 'Cannot connect to server';
    return throwError(() => new Error(message));
  }
}
