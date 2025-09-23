import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const USER_MANAGEMENT_ROUTES: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('./user-list/user-list.component').then(c => c.UserListComponent)
  // },
  // {
  //   path: 'add',
  //   loadComponent: () => import('./user-form/user-form.component').then(c => c.UserFormComponent),
  //   canActivate: [adminGuard]
  // },
  // {
  //   path: 'edit/:id',
  //   loadComponent: () => import('./user-form/user-form.component').then(c => c.UserFormComponent),
  //   canActivate: [adminGuard]
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./user-detail/user-detail.component').then(c => c.UserDetailComponent)
  // }
];