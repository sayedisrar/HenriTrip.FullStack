// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

// Make sure EXPORT is here
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if we should skip adding the auth header for this request
  const skipAuth = req.context.get(SKIP_AUTH);
  
  // Skip adding token for auth endpoints
  const isAuthEndpoint = req.url.includes('/Auth/login') ||
    req.url.includes('/Auth/register');

  let clonedReq = req;

  // Debug logging
  console.log('🔵 INTERCEPTOR - Request URL:', req.url);
  console.log('🔵 INTERCEPTOR - Skip Auth:', skipAuth);
  console.log('🔵 INTERCEPTOR - Is Auth Endpoint:', isAuthEndpoint);

  if (!skipAuth && !isAuthEndpoint) {
    const token = authService.getToken();
    console.log('🔵 INTERCEPTOR - Token exists:', !!token);
    
    if (token) {
      const isExpired = authService.isTokenExpired(token);
      console.log('🔵 INTERCEPTOR - Token expired:', isExpired);
      
      if (!isExpired) {
        clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ INTERCEPTOR - Added Authorization header');
      } else {
        console.warn('⚠️ INTERCEPTOR - Token expired, not adding header');
      }
    } else {
      console.warn('⚠️ INTERCEPTOR - No token found');
    }
  } else {
    console.log('🔵 INTERCEPTOR - Skipping token for this request');
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🔴 INTERCEPTOR - Error caught:', error.status, error.statusText);
      console.error('🔴 INTERCEPTOR - Error URL:', error.url);
      console.error('🔴 INTERCEPTOR - Error message:', error.message);
      
      if (error.status === 401) {
        console.warn('⚠️ INTERCEPTOR - 401 Unauthorized, logging out');
        authService.logout();
        router.navigate(['/login'], {
          queryParams: {
            returnUrl: router.url,
            sessionExpired: true
          }
        });
      }
      return throwError(() => error);
    })
  );
};