
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for auth endpoints (login, register)
  const isAuthEndpoint = req.url.includes('/Auth/login') ||
    req.url.includes('/Auth/register');

  let clonedReq = req;

  if (token && !isAuthEndpoint) {
    // Only add token if it's not expired
    if (!authService.isTokenExpired(token)) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Token expired, logout and redirect
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('Token expired'));
    }
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - clear session and redirect to login
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


//// src/app/interceptors/auth.interceptor.ts
//import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
//import { inject } from '@angular/core';
//import { Router } from '@angular/router';
//import { AuthService } from '../services/auth.service';
//import { catchError, throwError } from 'rxjs';

//export const authInterceptor: HttpInterceptorFn = (req, next) => {
//  const authService = inject(AuthService);
//  const router = inject(Router);
//  const token = authService.getToken();

//  let clonedReq = req;
//  if (token && !authService.isTokenExpired(token)) {
//    clonedReq = req.clone({
//      setHeaders: {
//        Authorization: `Bearer ${token}`
//      }
//    });
//  }

//  return next(clonedReq).pipe(
//    catchError((error: HttpErrorResponse) => {
//      if (error.status === 401) {
//        // Token expired or invalid
//        authService.logout();
//        router.navigate(['/login'], {
//          queryParams: { returnUrl: router.url }
//        });
//      }
//      return throwError(() => error);
//    })
//  );
//};
