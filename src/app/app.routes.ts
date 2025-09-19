import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { hrGuard } from './core/guards/hr.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(c => c.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'user-management',
        loadChildren: () => import('./features/user-management/user-management.routes').then(m => m.USER_MANAGEMENT_ROUTES),
        canActivate: [adminGuard]
      },
      {
        path: 'holidays',
        loadChildren: () => import('./features/holidays/holidays.routes').then(m => m.HOLIDAYS_ROUTES)
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.routes').then(m => m.LEAVE_ROUTES)
      },
      {
        path: 'posts',
        loadChildren: () => import('./features/posts/posts.routes').then(m => m.POSTS_ROUTES)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES)
      },
      {
        path: 'policies',
        loadChildren: () => import('./features/policies/policies.routes').then(m => m.POLICIES_ROUTES)
      },
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes').then(m => m.TEAMS_ROUTES)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEES_ROUTES)
      },
      // {
      //   path: 'profile',
      //   loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent)
      // }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];