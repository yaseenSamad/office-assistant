import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const TEAMS_ROUTES: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('./team-list/team-list.component').then(c => c.TeamListComponent)
  // },
  // {
  //   path: 'create',
  //   loadComponent: () => import('./team-form/team-form.component').then(c => c.TeamFormComponent),
  //   canActivate: [adminGuard]
  // },
  // {
  //   path: 'edit/:id',
  //   loadComponent: () => import('./team-form/team-form.component').then(c => c.TeamFormComponent),
  //   canActivate: [hrGuard]
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./team-detail/team-detail.component').then(c => c.TeamDetailComponent)
  // }
];