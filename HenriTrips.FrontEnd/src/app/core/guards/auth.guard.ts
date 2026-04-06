// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn, type CanActivateChildFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  localStorage.setItem('redirect_url', state.url);

  // Immediately redirect to login page
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  // Return false to prevent the component from loading
  return false;
};

// Guard for child routes
export const authChildGuard: CanActivateChildFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  localStorage.setItem('redirect_url', state.url);
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
