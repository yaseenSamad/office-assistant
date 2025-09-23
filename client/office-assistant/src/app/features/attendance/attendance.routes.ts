import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./attendance.component').then(c => c.AttendanceComponent)
  },
  // {
  //   path: 'mark',
  //   loadComponent: () => import('./mark-attendance/mark-attendance.component').then(c => c.MarkAttendanceComponent)
  // },
  // {
  //   path: 'reports',
  //   loadComponent: () => import('./attendance-reports/attendance-reports.component').then(c => c.AttendanceReportsComponent),
  //   canActivate: [hrGuard]
  // }
];