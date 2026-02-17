import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../../core/services/payroll.service';
import { Payslip } from '../../../core/models/payslip.model';

@Component({
  selector: 'app-payslip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payslip-detail.component.html',
  styleUrl: './payslip-detail.component.css'
})
export class PayslipDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private payrollService = inject(PayrollService);
  private toastr = inject(ToastrService);

  payslip = signal<Payslip | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const payslipId = this.route.snapshot.paramMap.get('id');
    if (payslipId) {
      this.loadPayslipDetails(payslipId);
    } else {
      this.toastr.error('No payslip ID provided.');
      this.loading.set(false);
    }
  }

  loadPayslipDetails(id: string): void {
    this.loading.set(true);
    this.payrollService.getPayslipById(id).subscribe({
      next: (data) => {
        this.payslip.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load payslip details.');
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  printPayslip(): void {
    window.print();
  }
}