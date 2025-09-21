import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';

export const POLICIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./policies.component').then(c => c.PolicyComponent)
  },
  // {
  //   path: 'add',
  //   loadComponent: () => import('./policy-form/policy-form.component').then(c => c.PolicyFormComponent),
  //   canActivate: [hrGuard]
  // },
  // {
  //   path: 'edit/:id',
  //   loadComponent: () => import('./policy-form/policy-form.component').then(c => c.PolicyFormComponent),
  //   canActivate: [hrGuard]
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./policy-detail/policy-detail.component').then(c => c.PolicyDetailComponent)
  // }
];