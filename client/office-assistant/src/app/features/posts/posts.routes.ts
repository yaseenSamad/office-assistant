import { Routes } from '@angular/router';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./posts.component').then(c => c.PostManagementComponent)
  },
  // {
  //   path: 'create',
  //   loadComponent: () => import('./post-form/post-form.component').then(c => c.PostFormComponent)
  // },
  // {
  //   path: 'edit/:id',
  //   loadComponent: () => import('./post-form/post-form.component').then(c => c.PostFormComponent)
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./post-detail/post-detail.component').then(c => c.PostDetailComponent)
  // }
];