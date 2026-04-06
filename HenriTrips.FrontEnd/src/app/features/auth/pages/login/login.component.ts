import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

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
            <span class="material-symbols" *ngIf="!isLoading">login</span>
            <span class="spinner" *ngIf="isLoading" style="width: 20px; height: 20px; border-width: 2px; margin-right: 8px;"></span>
            {{ isLoading ? 'Logging in...' : 'Sign In' }}
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
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error || 'Invalid email or password.';
      }
    });
  }
}
