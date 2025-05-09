import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="forgot-password-container">
      <h2>Reset Password</h2>
      <p class="instruction">Enter your email address and we'll send you a link to reset your password.</p>
      
      <div class="alert alert-success" *ngIf="submitted && !error">
        Password reset instructions have been sent to your email.
      </div>
      
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
      </div>
      
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" *ngIf="!submitted || error">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="submitted && f.email.errors"
            placeholder="Enter your email address"
          />
          <div class="invalid-feedback" *ngIf="submitted && f.email.errors">
            <div *ngIf="f.email.errors.required">Email is required</div>
            <div *ngIf="f.email.errors.email">Email must be valid</div>
          </div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Sending...' : 'Reset Password' }}
          </button>
        </div>
        
        <div class="text-center mt-3">
          <a routerLink="/auth/login">Return to login</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      max-width: 400px;
      margin: 0 auto;
    }
    
    h2 {
      margin-bottom: var(--space-2);
      text-align: center;
    }
    
    .instruction {
      text-align: center;
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
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
    
    .w-100 {
      width: 100%;
    }
    
    .text-center {
      text-align: center;
    }
    
    .mt-3 {
      margin-top: var(--space-3);
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  
  constructor(private formBuilder: FormBuilder) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  get f() { return this.forgotPasswordForm.controls; }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Mock API call - would be replaced with actual service call
    setTimeout(() => {
      this.loading = false;
      this.error = '';
      // Success is shown via the template when submitted is true and error is empty
    }, 1500);
  }
}