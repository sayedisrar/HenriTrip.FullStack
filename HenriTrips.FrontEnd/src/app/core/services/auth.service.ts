// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, throwError, switchMap, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginApiResponse,
  RegisterApiResponse,
  ApiResponse
} from '../models/auth.models';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  invitedGuideIds: string[];
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
      switchMap(response => {
        console.log('🔵 Login API response:', response);
        
        if (response.success && response.data) {
          localStorage.setItem('henri_trips_jwt', response.data);
          
          const decodedUser = this.decodeUserFromToken(response.data);
          console.log('🔵 Decoded user from token:', decodedUser);
          
          if (decodedUser && decodedUser.role !== 'admin') {
            return this.fetchUserInvitedGuides(decodedUser.id).pipe(
              map(invitedGuideIds => ({
                id: decodedUser.id,
                name: decodedUser.name,
                email: decodedUser.email,
                role: decodedUser.role,
                invitedGuideIds: invitedGuideIds
              }))
            );
          }
          
          if (decodedUser) {
            return of({
              id: decodedUser.id,
              name: decodedUser.name,
              email: decodedUser.email,
              role: decodedUser.role,
              invitedGuideIds: []
            });
          }
          
          return of(null);
        }
        throw new Error(response.message || 'Login failed');
      }),
      map(user => {
        if (user) {
          this.currentUser.set(user);
          console.log('✅ User set in signal:', this.currentUser());
          return { success: true, token: this.getToken()! };
        }
        throw new Error('Failed to load user data');
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

  // Fetch user's invited guides from backend
  private fetchUserInvitedGuides(userId: string) {
    console.log('🔵 FETCHING INVITED GUIDES FOR USER:', userId);
    
    // Get token directly from localStorage
    const token = localStorage.getItem('henri_trips_jwt');
    
    // Create headers manually
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.get(
      `${this.apiUrl}/users/${userId}/invited-guides`,
      { headers: headers }
    ).pipe(
      map((response: any) => {
        console.log('🔵 INVITED GUIDES API RESPONSE:', response);
        
        if (response && response.success && response.data) {
          const guideIds = response.data.map((id: any) => id.toString());
          console.log('🔵 FINAL INVITED GUIDE IDs (strings):', guideIds);
          return guideIds;
        }
        console.log('🔵 No invited guides found');
        return [];
      }),
      catchError((error) => {
        console.error('🔴 FAILED to fetch invited guides:', error);
        return of([]);
      })
    );
  }

  private decodeUserFromToken(token: string): { id: string; name: string; email: string; role: 'admin' | 'user' } | null {
    try {
      const decoded: any = jwtDecode(token);
      console.log('🔵 Decoded JWT token:', decoded);

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

      let role: 'admin' | 'user' = 'user';
      if (roleClaim) {
        if (Array.isArray(roleClaim)) {
          role = roleClaim.some(r => r.toLowerCase() === 'admin') ? 'admin' : 'user';
        } else {
          role = roleClaim.toString().toLowerCase() === 'admin' ? 'admin' : 'user';
        }
      }

      return {
        id: id || 'unknown',
        name: name || 'User',
        email: email || '',
        role: role
      };
    } catch (e) {
      console.error('🔴 Failed to decode token:', e);
      return null;
    }
  }

  private decodeAndSetUser(token: string) {
    const user = this.decodeUserFromToken(token);
    
    if (user) {
      if (user.role === 'admin') {
        this.currentUser.set({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          invitedGuideIds: []
        });
        console.log('✅ Admin user set:', this.currentUser());
      } else {
        console.log('🔵 Fetching invites for regular user:', user.id);
        this.fetchUserInvitedGuides(user.id).subscribe({
          next: (invitedGuideIds) => {
            this.currentUser.set({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              invitedGuideIds: invitedGuideIds
            });
            console.log('✅ Regular user set with invites:', this.currentUser());
          },
          error: (error) => {
            console.error('🔴 Failed to load invites:', error);
            this.currentUser.set({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              invitedGuideIds: []
            });
          }
        });
      }
    }
  }

  private handleError(error: any) {
    console.error('🔴 AuthService Error Details:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat();
      errorMessage = messages.join(', ');
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check if the API is running.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}