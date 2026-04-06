import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { GuideListComponent } from './features/guides/guide-list/guide-list.component';
import { GuideDetailComponent } from './features/guides/guide-detail/guide-detail.component';
import { GuideFormComponent } from './features/guides/guide-form/guide-form.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { authGuard, authChildGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // Protect the dashboard route
    canActivateChild: [authChildGuard], // Protect all child routes
    children: [
      { path: '', component: GuideListComponent },
      // Admin Guide Routes
      { path: 'guides/new', component: GuideFormComponent, canActivate: [adminGuard] },
      { path: 'guides/:id/edit', component: GuideFormComponent, canActivate: [adminGuard] },
      { path: 'guides/:id', component: GuideDetailComponent },

      // Admin User Routes
      { path: 'users', component: UserListComponent, canActivate: [adminGuard] },
      { path: 'users/new', component: UserFormComponent, canActivate: [adminGuard] },
      { path: 'users/:id/edit', component: UserFormComponent, canActivate: [adminGuard] }
    ]
  },
  // Optional: Add a wildcard route for 404 - redirect to login
  { path: '**', redirectTo: '/login' }
];
