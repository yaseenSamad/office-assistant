export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}


export interface LeaveRequest {
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

export interface LeaveType {
  leaveTypeId?: string;
  name: string;
  isHalfDayAllowed: boolean;
  carryForward: boolean;
  totalAllowed: number;
}

export interface LeaveBalance {
  leaveType: string;
  totalAllowed: number;
  used: number;
  remaining: number;
}