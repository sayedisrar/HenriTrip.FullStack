// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!auth.isAuthenticated()) {
    localStorage.setItem('redirect_url', state.url);
    return router.createUrlTree(['/login']);
  }

  // Then check if user is admin
  if (auth.isAdmin()) {
    return true;
  }

  // Refuse access to regular users
  return router.createUrlTree(['/dashboard']);
};
