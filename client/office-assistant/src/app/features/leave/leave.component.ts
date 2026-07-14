import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import moment from 'moment';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { LeaveBalance, LeaveRequest, LeaveStatus, LeaveType } from '../../core/models/leave.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss'],
})
export class LeaveComponent implements OnInit {
  apiUrl = environment.apiUrl;
  leaveRequests: LeaveRequest[] = [];
  pendingLeaveForApproval: LeaveRequest[] = []
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  
  selectedUserId = '';
  allUsers: any[] = [];
  loggedInUserId = '';

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

  selectedLeaveType: any;
  declineReason: string = '';
  selectedLeaveForDecline: string | null = null;

  constructor(
    private leaveService: LeaveService,
    public authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  get currentYear(){
    return  moment().year();
  }

  ngOnInit(): void {
    const currentUserData: any = this.authService.getUserData();
    this.loggedInUserId = currentUserData?.userId || '';

    if (!this.authService.selectedUserId()) {
      this.authService.selectedUserId.set(this.loggedInUserId);
    }
    this.selectedUserId = this.authService.selectedUserId();

    if (this.authService.isAdminOrHR()) {
      this.userService.getAllUsers().subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.allUsers = res.data || [];
          }
        },
        error: (err) => console.error('Failed to load users list:', err)
      });
    }

    this.loadLeaveTypes();
    this.loadLeaveRequests();
    this.loadLeaveRequestsWaitingForApproval();
  }

  onUserChange(userId: string): void {
    this.authService.selectedUserId.set(userId);
    this.selectedUserId = userId;
    this.loadLeaveTypes();
    this.loadLeaveRequests();
  }

  onLeaveTypeChange() {
    this.selectedLeaveType = this.leaveTypes.find(
      (t) => t.leaveTypeId === this.newLeave.leaveTypeId
    );

    if (this.selectedLeaveType && !this.selectedLeaveType.isHalfDayAllowed) {
      this.newLeave.durationDays = 1;
    }
  }

  loadLeaveTypes() {
    this.leaveService.getLeaveTypes(this.selectedUserId).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.leaveTypes = res.data || []
        }else{
          this.leaveTypes = []
          this.toastr.error('Failed to load leave types')
        }
      },
      error: (err) => {
        this.leaveTypes = []
        this.toastr.error('Failed to load leave types')
        console.error(err)
      }
    });
  }

  loadLeaveRequests() {
    this.leaveService.getMyLeaves(this.selectedUserId).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.leaveRequests = res.data || []
        }else{
          this.leaveRequests = []
          this.toastr.error('Failed to load leave requests')
        }
      },
      error: (err) => {
        console.error(err)
        this.leaveRequests = []
        this.toastr.error('Failed to load leave requests')
      },
    });
  }

  loadLeaveRequestsWaitingForApproval() {
    this.leaveService.getPendingApprovals(this.loggedInUserId).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.pendingLeaveForApproval = res.data || []
        }else{
          this.pendingLeaveForApproval = []
          this.toastr.error('Failed to load pending leave requests waiting for approval')
        }
      },
      error: (err) => {
        this.pendingLeaveForApproval = []
        this.toastr.error('Failed to load pending leave requests waiting for approval')
        console.error(err)
      },
    });
  }

  applyLeave() {
    this.leaveService.applyLeave(this.selectedUserId,this.newLeave).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.toastr.success('Leave applied succesfully');
          this.loadLeaveRequestsWaitingForApproval()
          this.loadLeaveRequests();
          this.loadLeaveTypes()
          this.newLeave = { startDate: '', endDate: '', durationDays: 1, leaveTypeId: '', reason: '' };
        }else{
          this.toastr.error('Failed to apply leave')
        }
      },
      error: (err) => {
        console.error(err)
        this.toastr.error('Failed to apply leave')
      },
    });
  }

  approveLeave(leaveId: string) {
    this.leaveService.updateLeaveStatus(this.loggedInUserId,leaveId, { status: LeaveStatus.APPROVED }).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.toastr.success('Leave approved succesfully');
          this.loadLeaveRequests()
          this.loadLeaveRequestsWaitingForApproval()
          this.loadLeaveTypes()
        }else{
          this.toastr.error('Failed to approve leave')
        }
      },
      error: (err) => {
        console.error(err)
        this.toastr.error('Failed to approve leave')
      },
    });
  }

  openRejectDialog(leaveId: string) {
    this.selectedLeaveForDecline = leaveId;
    const reason = prompt('Enter reason for rejection:');
    if (reason) this.rejectLeave(leaveId, reason);
  }

  rejectLeave(leaveId: string, reason: string) {
    this.leaveService.updateLeaveStatus(this.loggedInUserId,leaveId, { status: LeaveStatus.REJECTED, declineReason: reason }).subscribe({
      next: (res) => {
      if(res.statusCode == 200){
        this.toastr.success('Leave rejected succesfully');
        this.loadLeaveRequestsWaitingForApproval()
        this.loadLeaveRequests();
        this.loadLeaveTypes()
      }else{
        this.toastr.error('Failed to reject leave')
      }
      },
      error: (err) => {
        console.error(err)
        this.toastr.error('Failed to reject leave')
      },
    });
  }

  addLeaveType() {
    if (!this.newLeaveType.name.trim()) {
      this.toastr.warning('Enter leave type name')
      return 
    }

    this.leaveService.createLeaveType(this.loggedInUserId,this.newLeaveType).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.toastr.success('Leave type added succesfully');
          this.newLeaveType = { name: '', isHalfDayAllowed: false,carryForward: false,totalAllowed: 1 };
          this.loadLeaveTypes();
          this.loadLeaveRequestsWaitingForApproval()
          this.loadLeaveRequests();
        }else{
          this.toastr.error('Failed to add leave type')
        }
      },
      error: (err) => {
        console.error(err)
        this.toastr.error('Failed to add leave type')
      },
    });
  }

  deleteLeaveType(leaveTypeId: string) {
      this.leaveService.deleteLeaveType(leaveTypeId).subscribe({
        next: (res) => {
          if(res.statusCode == 200){
            this.toastr.success('Leave deleted succesfully');
            this.loadLeaveTypes()
            this.loadLeaveRequestsWaitingForApproval()
            this.loadLeaveRequests();
          }else{
            this.toastr.error('Failed to delete leave type')
          }

        },
        error: (err) => {
          this.toastr.error('Failed to delete leave type')
          console.error(err)
        },
      });
    
  }

  formatDate(date: string): string | null {
    if(!date) return null
    return moment(date).format('YYYY-MM-DD');
  }
}
