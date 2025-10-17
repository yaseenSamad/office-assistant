import { Component, OnInit, OnDestroy } from '@angular/core';
import { AttendanceService } from '../../core/services/attendance.service';
import moment from 'moment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface AttendanceRecord {
  attendanceDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  effectiveHours?: string;
  isManualOut: boolean | null;
  active: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit, OnDestroy {
  records: AttendanceRecord[] = [];
  today = moment().format('YYYY-MM-DD');
  startDate = '';
  endDate = '';
  currentTime = '';
  clockStatus: 'clocked-in' | 'clocked-out' = 'clocked-out';
  workingHours = '0h 0m';

  private timerSub?: Subscription;
  private clockInStartTime?: moment.Moment;

  constructor(private authService: AuthService,private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    this.endDate = this.today;

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    this.loadTodayStatus();
    this.loadAttendanceList();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  updateTime(): void {
    this.currentTime = moment().format('HH:mm:ss');
  }

  loadAttendanceList(): void {
    const currentUserData: any = this.authService.getUserData()
    const payload = {
      userId: currentUserData.userId,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.attendanceService.getAttendance(payload).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
            this.records = (res.data || []).map((rec: any) => {
            // Compute effective hours if both times are available
            if (rec.clockInTime && rec.clockOutTime) {
              const start = moment(rec.clockInTime);
              const end = moment(rec.clockOutTime);
              const duration = moment.duration(end.diff(start));
              const hours = Math.floor(duration.asHours());
              const minutes = Math.floor(duration.minutes());
              rec.effectiveHours = `${hours}h ${minutes}m`;
            } else {
              rec.effectiveHours = '-';
            }
            return rec;
          });

        }else{
          this.records = [];
        }
      },
      error: (err) => {
        this.records = [];
        console.error('Error loading attendance list:', err)
      },
    });
  }

  loadTodayStatus(): void {
    const currentUserData: any = this.authService.getUserData()
    this.attendanceService.getTodayAttendance(currentUserData.userId).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          const todayStatus = res.data;

          if (todayStatus && todayStatus.active) {
            const clockInDate = moment(todayStatus.attendanceDate).format('YYYY-MM-DD');

            if (clockInDate !== this.today) {
              this.clockStatus = 'clocked-out';
              this.workingHours = '0h 0m';
            } else {
              this.clockStatus = 'clocked-in';
              this.clockInStartTime = moment(todayStatus.clockInTime);
              this.startWorkingHoursCounter();
            }
          } else {
            this.clockStatus = 'clocked-out';
            this.workingHours = '0h 0m';
          }
        }else{
            this.clockStatus = 'clocked-out';
            this.workingHours = '0h 0m';
        }
 
      },
      error: (err) =>{ 
        this.clockStatus = 'clocked-out';
        this.workingHours = '0h 0m';
        console.error('Error loading today status:', err)
      },
    });
  }

  toggleClock(): void {
    const actionType = this.clockStatus === 'clocked-out' ? 'clock-in' : 'clock-out';
    const currentUserData: any = this.authService.getUserData()
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    this.attendanceService.createAttendance({ userId: currentUserData.userId, actionType , currentDate: currentDate , currentTime: currentTime }).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
            const record = res.data;

            if (actionType === 'clock-in') {
              this.clockStatus = 'clocked-in';
              this.clockInStartTime = moment(record.clockInTime);
              this.startWorkingHoursCounter();
            } else {
              this.clockStatus = 'clocked-out';
              this.timerSub?.unsubscribe();
              this.workingHours = this.calculateWorkedTime(this.clockInStartTime!, moment());
              this.loadAttendanceList();
            }
        }else{

        }
      },
      error: (err) => {
        console.error('Clock action failed:', err)
      },
    });
  }

  startWorkingHoursCounter(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = interval(60000).subscribe(() => {
      if (this.clockInStartTime) {
        const now = moment();
        this.workingHours = this.calculateWorkedTime(this.clockInStartTime, now);
      }
    });

    if (this.clockInStartTime) {
      this.workingHours = this.calculateWorkedTime(this.clockInStartTime, moment());
    }
  }

  calculateWorkedTime(start: moment.Moment, end: moment.Moment): string {
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    return `${hours}h ${minutes}m`;
  }

  applyFilter(): void {
    this.loadAttendanceList();
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
