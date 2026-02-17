import { Routes } from '@angular/router';
import { PayrollRunComponent } from './payroll-run/payroll-run.component';
import { MyPayslipsComponent } from './my-payslips/my-payslips.component';
import { PayslipDetailComponent } from './payslip-detail/payslip-detail.component';
import { hrGuard } from '../../core/guards/hr.guard';

export const PAYROLL_ROUTES: Routes = [
  {
    path: 'run',
    component: PayrollRunComponent,
    canActivate: [hrGuard]
  },
  {
    path: 'my-payslips',
    component: MyPayslipsComponent
  },
  {
    path: 'payslips/:id',
    component: PayslipDetailComponent,
    canActivate: [hrGuard]
  },
  {
    path: '',
    redirectTo: 'run',
    pathMatch: 'full'
  }
];
