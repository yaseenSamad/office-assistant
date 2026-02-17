import { User } from './user.model';

export interface Payslip {
  payslipId: string;
  userId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'unpaid';
  user?: Partial<User>;
  createdAt: string;
  updatedAt: string;
}
