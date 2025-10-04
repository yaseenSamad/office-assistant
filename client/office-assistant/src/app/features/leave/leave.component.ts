import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import moment from 'moment';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveStatus } from '../../core/models/leave.model';

interface LeaveRequest {
  leaveId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
  declineReason?: string;
}

interface LeaveType {
  leaveTypeId?: string;
  name: string;
  isHalfDayAllowed: boolean;
  carryForward: boolean;
  totalAllowed: number;
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
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss'],
})
export class LeaveComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];

  // Form Models
  newLeave: any = {
    startDate: '',
    endDate: '',
    durationDays: 1,
    leaveTypeId: '',
    reason: '',
  };

  newLeaveType: LeaveType = {
    name: '',
    isHalfDayAllowed: false,
    carryForward: false,
    totalAllowed: 1
  };

  declineReason: string = '';
  selectedLeaveForDecline: string | null = null;

  constructor(private leaveService: LeaveService,private authService: AuthService) {}

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.loadLeaveRequests();
  }

  loadLeaveTypes() {
    this.leaveService.getLeaveTypes().subscribe({
      next: (res) => (this.leaveTypes = res.data || []),
      error: (err) => console.error(err),
    });
  }

  loadLeaveRequests() {
    const currentUserData: any = this.authService.getUserData()
    this.leaveService.getMyLeaves(currentUserData.userId).subscribe({
      next: (res) => (this.leaveRequests = res.data || []),
      error: (err) => console.error(err),
    });
  }

  // 🟩 Apply leave
  applyLeave() {
    const currentUserData: any = this.authService.getUserData()
    this.leaveService.applyLeave(currentUserData.userId,this.newLeave).subscribe({
      next: () => {
        alert('Leave Applied Successfully');
        this.loadLeaveRequests();
        this.newLeave = { startDate: '', endDate: '', durationDays: 1, leaveTypeId: '', reason: '' };
      },
      error: (err) => console.error(err),
    });
  }

  // 🟨 Approve Leave
  approveLeave(leaveId: string) {
    const currentUserData: any = this.authService.getUserData()
    this.leaveService.updateLeaveStatus(currentUserData.userId,leaveId, { status: LeaveStatus.APPROVED }).subscribe({
      next: () => this.loadLeaveRequests(),
      error: (err) => console.error(err),
    });
  }

  // 🟥 Open Reject Dialog
  openRejectDialog(leaveId: string) {
    this.selectedLeaveForDecline = leaveId;
    const reason = prompt('Enter reason for rejection:');
    if (reason) this.rejectLeave(leaveId, reason);
  }

  // 🟥 Reject Leave
  rejectLeave(leaveId: string, reason: string) {
    const currentUserData: any = this.authService.getUserData()
    this.leaveService.updateLeaveStatus(currentUserData.userId,leaveId, { status: LeaveStatus.REJECTED, declineReason: reason }).subscribe({
      next: () => {
        alert('Leave Rejected');
        this.loadLeaveRequests();
      },
      error: (err) => console.error(err),
    });
  }

  // 🟦 Create Leave Type
  addLeaveType() {
    if (!this.newLeaveType.name.trim()) return alert('Enter leave type name');

    const currentUserData: any = this.authService.getUserData()
    this.leaveService.createLeaveType(currentUserData.userId,this.newLeaveType).subscribe({
      next: () => {
        alert('Leave Type Added');
        this.newLeaveType = { name: '', isHalfDayAllowed: false,carryForward: false,totalAllowed: 1 };
        this.loadLeaveTypes();
      },
      error: (err) => console.error(err),
    });
  }

  // 🟧 Delete Leave Type
  deleteLeaveType(leaveTypeId: string) {
    if (confirm('Delete this leave type?')) {
      this.leaveService.deleteLeaveType(leaveTypeId).subscribe({
        next: () => this.loadLeaveTypes(),
        error: (err) => console.error(err),
      });
    }
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }
}
