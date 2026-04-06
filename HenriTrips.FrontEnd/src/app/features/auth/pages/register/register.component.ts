import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="glass-panel login-card slide-up">
        <h2>Create an Account</h2>
        <p>Sign up to start planning your journeys.</p>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" style="margin-top: 2rem;">
          
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="user@example.com" required>
            <div class="error-text" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" style="color: var(--danger); font-size: 0.8rem; margin-top: 0.25rem;">
              Please enter a valid email.
            </div>
          </div>
          
          <div class="form-group" style="text-align: left;">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••" required>
            <div class="error-text" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" style="color: var(--danger); font-size: 0.8rem; margin-top: 0.25rem;">
              Password must be at least 6 characters.
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="error-text" style="margin-bottom: 1rem; color: var(--danger);">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-text" style="margin-bottom: 1rem; color: var(--success); padding: 0.5rem; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm);">
            {{ successMessage }} Redirecting to login...
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" [disabled]="registerForm.invalid || isLoading">
            <span class="spinner" *ngIf="isLoading" style="width: 20px; height: 20px; border-width: 2px; margin-right: 8px;"></span>
            {{ isLoading ? 'Creating account...' : 'Register' }}
          </button>
          
          <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
            Already have an account? <a routerLink="/login" style="color: var(--primary); text-decoration: none;">Log in here</a>
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
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Account created successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        // Parse .NET Identity Errors array if present
        if (Array.isArray(err.error)) {
           this.errorMessage = err.error.map((e: any) => e.description).join(' ');
        } else {
           this.errorMessage = err.error?.message || err.error || 'Registration failed.';
        }
      }
    });
  }
}
