import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import moment from 'moment';
import { NgApexchartsModule } from 'ng-apexcharts';

interface LeaveRequest {
  leaveId: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
}

interface LeaveBalance {
  leaveType: string;
  totalAllowed: number;
  used: number;
  remaining: number;
}

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule,NgApexchartsModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  leaveBalances: LeaveBalance[] = [];
  policyLink = '/assets/policies/leave-policy.pdf';

  ngOnInit(): void {
    // Mock Leave History
    this.leaveRequests = [
      {
        leaveId: 1,
        startDate: '2025-09-20',
        endDate: '2025-09-20',
        durationDays: 1,
        leaveType: 'Casual Leave',
        reason: 'Personal work',
        status: 'Pending',
        requestedBy: 'John Doe',
        requestedAt: '2025-09-15',
        approvedBy: null
      },
      {
        leaveId: 2,
        startDate: '2025-08-10',
        endDate: '2025-08-11',
        durationDays: 2,
        leaveType: 'Sick Leave',
        reason: 'Flu and rest',
        status: 'Approved',
        requestedBy: 'John Doe',
        requestedAt: '2025-08-08',
        approvedBy: 'HR Manager'
      },
      {
        leaveId: 3,
        startDate: '2025-07-05',
        endDate: '2025-07-05',
        durationDays: 0.5,
        leaveType: 'Casual Leave',
        reason: 'Doctor appointment',
        status: 'Rejected',
        requestedBy: 'John Doe',
        requestedAt: '2025-07-03',
        approvedBy: 'HR Manager'
      }
    ];

    // Mock Leave Balances
    this.leaveBalances = [
      { leaveType: 'Casual Leave', totalAllowed: 12, used: 5, remaining: 7 },
      { leaveType: 'Sick Leave', totalAllowed: 10, used: 3, remaining: 7 },
      { leaveType: 'Earned Leave', totalAllowed: 15, used: 6, remaining: 9 },
      { leaveType: 'Earned Leave', totalAllowed: 15, used: 6, remaining: 9 }
    ];
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }
}
