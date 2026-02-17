import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../../core/services/payroll.service';

@Component({
  selector: 'app-payroll-run',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payroll-run.component.html',
  styleUrl: './payroll-run.component.css'
})
export class PayrollRunComponent {
  private formBuilder = inject(FormBuilder);
  private payrollService = inject(PayrollService);
  private toastr = inject(ToastrService);

  payrollForm: FormGroup;
  loading = false;

  constructor() {
    this.payrollForm = this.formBuilder.group({
      payPeriodStart: ['', Validators.required],
      payPeriodEnd: ['', Validators.required]
    });
  }

  runPayroll(): void {
    if (this.payrollForm.invalid) {
      this.toastr.error('Please select a valid start and end date.');
      return;
    }

    this.loading = true;
    const { payPeriodStart, payPeriodEnd } = this.payrollForm.value;

    this.payrollService.runPayroll({ payPeriodStart, payPeriodEnd }).subscribe({
      next: (response) => {
        this.toastr.success(`Payroll run completed successfully! ${response.payslipsCreated} payslips were generated.`);
        this.loading = false;
        this.payrollForm.reset();
      },
      error: (err) => {
        this.toastr.error('Payroll run failed. Please check the server logs.');
        console.error('Payroll run error:', err);
        this.loading = false;
      }
    });
  }
}