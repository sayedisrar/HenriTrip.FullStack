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

  if (!skipAuth && !isAuthEndpoint) {
    const token = authService.getToken();
    
    if (token && !authService.isTokenExpired(token)) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
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