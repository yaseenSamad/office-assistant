import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../../core/services/payroll.service';
import { Payslip } from '../../../core/models/payslip.model';

@Component({
  selector: 'app-my-payslips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-payslips.component.html',
  styleUrl: './my-payslips.component.css'
})
export class MyPayslipsComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private toastr = inject(ToastrService);

  payslips = signal<Payslip[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.loading.set(true);
    this.payrollService.getMyPayslips().subscribe({
      next: (data) => {
        this.payslips.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load your payslips.');
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}