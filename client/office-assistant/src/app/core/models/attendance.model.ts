export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  LATE = 'LATE'
}

export interface Attendance {
  id: string;
  userId: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
}

export interface MarkAttendanceDto {
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceDto {
  checkOut: Date;
  notes?: string;
}

export interface AttendanceFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  status?: AttendanceStatus;
}