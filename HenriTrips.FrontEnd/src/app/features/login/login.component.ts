import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="glass-panel login-card slide-up">
        <h2>Welcome to Henri Trips</h2>
        <p>Log in to plan your next adventure.</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" style="margin-top: 2rem;">
          
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="admin@example.com" required>
          </div>
          
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" required>
          </div>
          
          <div *ngIf="errorMessage" class="error-text" style="margin-bottom: 1rem; color: var(--danger);">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" [disabled]="loginForm.invalid || isLoading">
            <span class="spinner" *ngIf="isLoading" style="width: 20px; height: 20px; border-width: 2px; margin-right: 8px;"></span>
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          
          <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
            Don't have an account? <a routerLink="/register" style="color: var(--primary); text-decoration: none;">Create one here</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
      text-align: center;
    }
    .spinner {
      display: inline-block;
      vertical-align: middle;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';
  returnUrl: string = '/dashboard';

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngOnInit() {
    // Get return URL from query params or stored redirect URL
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ||
      localStorage.getItem('redirect_url') ||
      '/dashboard';

    // Check if session expired (ADD THIS BLOCK)
    if (this.route.snapshot.queryParams['sessionExpired'] === 'true') {
      this.errorMessage = 'Your session has expired. Please login again.';
    }

    // Clear stored redirect URL
    localStorage.removeItem('redirect_url');

    // Redirect if already logged in
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to the return URL after successful login
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        // Clear password field on error for security
        this.loginForm.patchValue({ password: '' });

        // Handle different error scenarios
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid request. Please check your credentials.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = err.error?.message || err.error || 'Invalid email or password.';
        }
      }
    });
  }
}
