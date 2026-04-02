import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAdmin()) {
    return true;
  }
  
  // Refuse access to regular users
  return router.createUrlTree(['/dashboard']);
};
