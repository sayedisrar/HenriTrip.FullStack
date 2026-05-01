// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginApiResponse,
  RegisterApiResponse
} from '../models/auth.models';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  invitedGuideIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  currentUser = signal<User | null>(null);

  constructor() {
    this.resumeSession();
  }

  private resumeSession() {
    const token = this.getToken();
    if (token) {
      if (this.isTokenExpired(token)) {
        this.logout();
      } else {
        this.decodeAndSetUser(token);
      }
    }
  }

  register(model: RegisterRequest) {
    return this.http.post<RegisterApiResponse>(`${this.apiUrl}/register`, model).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  login(model: LoginRequest) {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login`, model).pipe(
      map(response => {
        console.log('Login API response:', response);
        
        if (response.success && response.data) {
          // Store token (response.data contains the token string)
          localStorage.setItem('henri_trips_jwt', response.data);
          this.decodeAndSetUser(response.data);
          return { success: true, token: response.data };
        }
        throw new Error(response.message || 'Login failed');
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('henri_trips_jwt');
  }

  getToken(): string | null {
    return localStorage.getItem('henri_trips_jwt');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp === undefined) return false;
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date.valueOf() < new Date().valueOf();
    } catch {
      return true;
    }
  }

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      console.log('Decoded token:', decoded);

      // Handle different claim types
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
        || decoded.role 
        || decoded['role'];
      
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
        || decoded.email 
        || decoded['email'];
      
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
        || decoded.unique_name 
        || decoded.name 
        || email;
      
      const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
        || decoded.sub 
        || decoded.nameid 
        || decoded['id'];

      // Determine role (handle both string and array)
      let role: 'admin' | 'user' = 'user';
      if (roleClaim) {
        if (Array.isArray(roleClaim)) {
          role = roleClaim.some(r => r.toLowerCase() === 'admin') ? 'admin' : 'user';
        } else {
          role = roleClaim.toString().toLowerCase() === 'admin' ? 'admin' : 'user';
        }
      }

      this.currentUser.set({
        id: id || 'unknown',
        name: name || 'User',
        email: email || '',
        role: role,
        invitedGuideIds: []
      });
      
      console.log('User set:', this.currentUser());
    } catch (e) {
      console.error('Failed to decode token:', e);
      this.logout();
    }
  }

  private handleError(error: any) {
    console.error('AuthService Error Details:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat();
      errorMessage = messages.join(', ');
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check if the API is running on port 5172 or 7173.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}