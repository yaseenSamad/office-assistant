import { Routes } from '@angular/router';
import { hrGuard } from '../../core/guards/hr.guard';

export const HOLIDAYS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./holiday-list/holiday-list.component').then(c => c.HolidayListComponent)
  },
];