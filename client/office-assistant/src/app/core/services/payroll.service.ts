import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Salary } from '../models/salary.model';
import { Payslip } from '../models/payslip.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private salaryUrl = '/api/salaries';
  private payrollUrl = '/api/payroll';

  constructor(private http: HttpClient) { }

  createOrUpdateSalary(userId: string, salaryData: { amount: number; payType: 'monthly' | 'hourly' }): Observable<Salary> {
    return this.http.post<any>(`${this.salaryUrl}/${userId}`, salaryData).pipe(
      map(res => res.data)
    );
  }

  getSalary(userId: string): Observable<Salary> {
    return this.http.get<any>(`${this.salaryUrl}/${userId}`).pipe(
      map(res => res.data)
    );
  }

  runPayroll(payPeriod: { payPeriodStart: string, payPeriodEnd: string }): Observable<{ payslipsCreated: number }> {
    return this.http.post<any>(`${this.payrollUrl}/run`, payPeriod).pipe(
      map(res => res.data)
    );
  }

  getPayslips(): Observable<Payslip[]> {
    return this.http.get<any>(`${this.payrollUrl}`).pipe(
      map(res => res.data)
    );
  }

  getMyPayslips(): Observable<Payslip[]> {
    return this.http.get<any>(`${this.payrollUrl}/my-payslips`).pipe(
      map(res => res.data)
    );
  }

  getPayslipById(payslipId: string): Observable<Payslip> {
    return this.http.get<any>(`${this.payrollUrl}/${payslipId}`).pipe(
      map(res => res.data)
    );
  }
}
