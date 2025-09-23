import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-layout/auth-layout.component').then(c => c.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
      },
      // {
      //   path: 'register',
      //   loadComponent: () => import('../register/register.component').then(c => c.RegisterProfileComponent)
      // },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
      }
    ]
  }
];