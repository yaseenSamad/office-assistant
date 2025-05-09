import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <h2>Create a new account</h2>
      
      <div class="alert alert-error" *ngIf="error">
        {{ error }}
      </div>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="form-control"
                [class.is-invalid]="submitted && f['firstName'].errors"
              />
              <div class="invalid-feedback" *ngIf="submitted && f['firstName'].errors">
                <div *ngIf="f.firstName.errors.required">First Name is required</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="form-control"
                [class.is-invalid]="submitted && f['lastName'].errors"
              />
              <div class="invalid-feedback" *ngIf="submitted && f['lastName'].errors">
                <div *ngIf="f.lastName.errors.required">Last Name is required</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="submitted && f['email'].errors"
          />
          <div class="invalid-feedback" *ngIf="submitted && f['email'].errors">
            <div *ngIf="f.email.errors.required">Email is required</div>
            <div *ngIf="f.email.errors.email">Email must be valid</div>
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
          />
          <div class="invalid-feedback" *ngIf="submitted && f['password'].errors">
            <div *ngIf="f.password.errors.required">Password is required</div>
            <div *ngIf="f.password.errors.minlength">Password must be at least 6 characters</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="role" class="form-label">Role</label>
          <select
            id="role"
            formControlName="role"
            class="form-control"
            [class.is-invalid]="submitted && f['role'].errors"
          >
            <option [value]="UserRole.EMPLOYEE">Employee</option>
          </select>
          <div class="invalid-feedback" *ngIf="submitted && f['role'].errors">
            <div *ngIf="f.role.errors.required">Role is required</div>
          </div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </div>
        
        <div class="text-center mt-3">
          <p>Already have an account? <a routerLink="/auth/login">Login here</a></p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 500px;
      margin: 0 auto;
    }
    
    h2 {
      margin-bottom: var(--space-4);
      text-align: center;
    }
    
    .form-group {
      margin-bottom: var(--space-3);
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  UserRole = UserRole;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.EMPLOYEE, Validators.required]
    });
  }
  
  get f() { return this.registerForm.controls; }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}