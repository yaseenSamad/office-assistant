import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>Please sign in to your account</p>
      </div>
      
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
      </div>
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            id="username"
            formControlName="username"
            class="form-control"
            [class.is-invalid]="submitted && f['username'].errors"
            placeholder="Enter your username"
          />
          <div class="invalid-feedback" *ngIf="submitted && f['username'].errors">
            <div *ngIf="f.username.errors.required">Username is required</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="form-control"
            [class.is-invalid]="submitted && f['password'].errors"
            placeholder="Enter password"
          />
          <div class="invalid-feedback" *ngIf="submitted && f['password'].errors">
            <div *ngIf="f.password.errors.required">Password is required</div>
          </div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </div>
      </form>
      
      <div class="login-links">
        <div class="forgot-password">
          <a routerLink="/auth/forgot-password">Forgot your password?</a>
        </div>
        
        <div class="register-section">
          <p>Don't have an account?</p>
          <a routerLink="/auth/register" class="btn btn-outline">Register</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding: var(--space-4);
    }
    
    .login-header {
      margin-bottom: var(--space-4);
      text-align: center;
    }
    
    .login-header h1 {
      color: var(--neutral-800);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-2xl);
      font-weight: 600;
    }
    
    .login-header p {
      color: var(--neutral-600);
      margin-bottom: 0;
    }
    
    .form-group {
      margin-bottom: var(--space-4);
    }
    
    .form-label {
      font-weight: 500;
      color: var(--neutral-700);
    }
    
    .form-control {
      padding: var(--space-3);
      font-size: var(--font-size-md);
      border: 2px solid var(--neutral-300);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
    
    .is-invalid {
      border-color: var(--error);
    }
    
    .invalid-feedback {
      display: block;
      color: var(--error);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }
    
    .btn {
      padding: var(--space-3) var(--space-4);
      font-size: var(--font-size-md);
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .btn-primary {
      background-color: var(--primary);
      border: 2px solid var(--primary);
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-dark);
      border-color: var(--primary-dark);
      transform: translateY(-1px);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .login-help {
      margin-top: var(--space-5);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      text-align: center;
    }
    
    .login-links {
      margin-top: var(--space-4);
      text-align: center;
    }
    
    .forgot-password {
      margin-bottom: var(--space-4);
    }
    
    .forgot-password a {
      color: var(--primary);
      font-size: var(--font-size-sm);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    
    .forgot-password a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
    
    .register-section {
      padding-top: var(--space-3);
      border-top: 1px solid var(--neutral-200);
    }
    
    .register-section p {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .register-section .btn {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
      border-radius: var(--radius-md);
      text-decoration: none;
      display: inline-block;
      transition: all var(--transition-fast);
    }
    
    .btn-outline {
      background-color: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
    }
    
    .btn-outline:hover {
      background-color: var(--primary);
      color: white;
      transform: translateY(-1px);
    }
    
    .w-100 {
      width: 100%;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: var(--space-3);
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  
  get f() { return this.loginForm.controls; }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    // Convert username to email format for the existing auth service
    const credentials = {
      email: this.getEmailFromUsername(this.loginForm.value.username),
      password: this.loginForm.value.password
    };
    
    this.authService.login(credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: error => {
        this.error = error.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
  
  private getEmailFromUsername(username: string): string {
    // Map usernames to existing demo emails
    const usernameMap: { [key: string]: string } = {
      'admin': 'admin@example.com',
      'hr': 'hr@example.com',
      'employee': 'employee@example.com'
    };
    
    return usernameMap[username.toLowerCase()] || `${username}@example.com`;
  }
}