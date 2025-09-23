import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-content">
          <div class="auth-header">
            <h1 class="app-title">Office Assistant</h1>
            <p class="app-subtitle">Streamlining HR operations and employee management</p>
          </div>
          
          <router-outlet></router-outlet>
        </div>
        
        <div class="auth-image">
          <div class="overlay"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--neutral-100);
      padding: var(--space-3);
    }
    
    .auth-card {
      display: flex;
      width: 100%;
      max-width: 1000px;
      min-height: 600px;
      background-color: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    
    .auth-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: var(--space-6);
    }
    
    .auth-header {
      margin-bottom: var(--space-6);
      text-align: center;
    }
    
    .app-title {
      font-size: var(--font-size-2xl);
      color: var(--primary);
      margin-bottom: var(--space-2);
    }
    
    .app-subtitle {
      color: var(--neutral-600);
    }
    
    .auth-image {
      flex: 1;
      background-image: url('https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(25, 118, 210, 0.7);
    }
    
    @media (max-width: 768px) {
      .auth-card {
        flex-direction: column;
      }
      
      .auth-image {
        display: none;
      }
    }
  `]
})
export class AuthLayoutComponent {}