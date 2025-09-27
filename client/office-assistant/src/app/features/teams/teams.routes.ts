import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./team-list/team-list.component').then(c => c.TeamListComponent)
  }
];