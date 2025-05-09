export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER'
}

export interface Leave {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface CreateLeaveDto {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface UpdateLeaveStatusDto {
  status: LeaveStatus;
}