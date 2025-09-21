import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../leave/leave.component').then(c => c.LeaveComponent)
  },
  // {
  //   path: 'request',
  //   loadComponent: () => import('./leave-request/leave-request.component').then(c => c.LeaveRequestComponent)
  // },
  // {
  //   path: 'manage',
  //   loadComponent: () => import('./leave-management/leave-management.component').then(c => c.LeaveManagementComponent),
  //   canActivate: [hrGuard]
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./leave-detail/leave-detail.component').then(c => c.LeaveDetailComponent)
  // }
];