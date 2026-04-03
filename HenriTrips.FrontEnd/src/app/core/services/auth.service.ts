import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
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
  // Default fallback API url. Replace with configuration in the future.
  //private apiUrl = 'https://localhost:7079/api/auth';
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

  register(model: any) {
    // Model expects Email and Password based on .NET example
    return this.http.post(`${this.apiUrl}/register`, model);
  }

  login(model: any) {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, model).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('henri_trips_jwt', response.token);
          this.decodeAndSetUser(response.token);
        }
      })
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

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      
      // Standard JWT roles from .NET Identity
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email;
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || email;
      const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub;

      this.currentUser.set({
        id: id || 'unknown',
        name: name || 'User',
        email: email,
        role: (roleClaim && roleClaim.toString().toLowerCase() === 'admin') ? 'admin' : 'user',
        invitedGuideIds: [] // Can be populated from another request if needed.
      });
    } catch (e) {
      this.logout();
    }
  }

  private isTokenExpired(token: string): boolean {
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
}
