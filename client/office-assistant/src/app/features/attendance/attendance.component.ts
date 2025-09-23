import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface AttendanceRecord {
  attendanceDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  effectiveHours: string;
  isManualOut: boolean | null;
  active: boolean;
  isWeekend?: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  records: AttendanceRecord[] = [
    {
      attendanceDate: "2025-09-19",
      clockInTime: "2025-09-19T09:15:00",
      clockOutTime: null,
      effectiveHours: "06:20",
      isManualOut: null,
      active: true,
      isWeekend: false
    },
    {
      attendanceDate: "2025-09-18",
      clockInTime: "2025-09-18T09:30:00",
      clockOutTime: "2025-09-18T18:10:00",
      effectiveHours: "08:40",
      isManualOut: true,
      active: false,
      isWeekend: false
    },
    {
      attendanceDate: "2025-09-17",
      clockInTime: "2025-09-17T09:45:00",
      clockOutTime: "2025-09-17T23:59:59",
      effectiveHours: "14:14",
      isManualOut: false,
      active: false,
      isWeekend: false
    }
  ];

  today = moment().format('YYYY-MM-DD');
  startDate: string = '';
  endDate: string = '';

  currentTime: string = '';
  clockStatus: 'clocked-in' | 'clocked-out' = 'clocked-out';
  workingHours: string = '0h 0m';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Default filter: previous month first day → today
    this.startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    this.endDate = this.today;

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    this.loadAttendance();
  }

  loadAttendance(): void {
    // Example API call (currently mocked)
    // this.http.post<{ data: AttendanceRecord[] }>('/attendance/list', {
    //   userId: 123,
    //   startDate: this.startDate,
    //   endDate: this.endDate
    // }).subscribe(res => {
    //   this.records = res.data;
    // });
  }

  applyFilter(): void {
    this.loadAttendance();
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleClock(): void {
    this.clockStatus = this.clockStatus === 'clocked-out' ? 'clocked-in' : 'clocked-out';
    if (this.clockStatus === 'clocked-in') {
      this.startWorkingHoursCounter();
    }
  }

  startWorkingHoursCounter(): void {
    const startTime = Date.now();
    setInterval(() => {
      if (this.clockStatus === 'clocked-in') {
        const elapsed = Date.now() - startTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        this.workingHours = `${hours}h ${minutes}m`;
      }
    }, 60000);
  }

  formatTime(date: string | null): string {
    return date ? moment(date).format('HH:mm') : '-';
  }

  isToday(date: string): boolean {
    return date === this.today;
  }

  isWeekend(date: string): boolean {
    const day = moment(date).day();
    return day === 6 || day === 0;
  }
}
