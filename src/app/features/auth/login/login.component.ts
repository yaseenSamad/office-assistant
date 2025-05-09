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
      <h2>Login to your account</h2>
      
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
      </div>
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="submitted && f['email'].errors"
            placeholder="Email address"
          />
          <div class="invalid-feedback" *ngIf="submitted && f['email'].errors">
            <div *ngIf="f.email.errors.required">Email is required</div>
            <div *ngIf="f.email.errors.email">Email must be valid</div>
          </div>
        </div>
        
        <div class="form-group">
          <div class="d-flex justify-content-between">
            <label for="password" class="form-label">Password</label>
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
          </div>
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
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
      
      <div class="login-help">
        <p>Use the following demo accounts:</p>
        <div class="demo-accounts">
          <button type="button" class="btn btn-outline btn-sm" (click)="fillDemo('admin@example.com')">Admin</button>
          <button type="button" class="btn btn-outline btn-sm" (click)="fillDemo('hr@example.com')">HR</button>
          <button type="button" class="btn btn-outline btn-sm" (click)="fillDemo('employee@example.com')">Employee</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 0 auto;
    }
    
    h2 {
      margin-bottom: var(--space-4);
      text-align: center;
    }
    
    .form-group {
      margin-bottom: var(--space-4);
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
    
    .forgot-link {
      font-size: var(--font-size-sm);
    }
    
    .login-help {
      margin-top: var(--space-5);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      text-align: center;
    }
    
    .login-help p {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .demo-accounts {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
    }
    
    .btn-sm {
      padding: var(--space-1) var(--space-2);
      font-size: var(--font-size-xs);
    }
    
    .w-100 {
      width: 100%;
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
      email: ['', [Validators.required, Validators.email]],
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
    
    this.authService.login(this.loginForm.value).subscribe({
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
  
  fillDemo(email: string) {
    this.loginForm.patchValue({
      email: email,
      password: 'password'
    });
  }
}