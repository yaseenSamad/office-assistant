import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HolidayService } from '../../../core/services/holiday.service';
import { AuthService } from '../../../core/services/auth.service';
import { Holiday, CreateHolidayDto } from '../../../core/models/holiday.model';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss']
})
export class HolidayListComponent implements OnInit {
  private holidayService = inject(HolidayService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);

  holidays = signal<Holiday[]>([]);
  showModal = signal(false);
  loading = false;
  submitted = false;
  editingHoliday: Holiday | null = null;

  holidayForm: FormGroup = this.formBuilder.group({
    holName: ['', Validators.required],
    holDate: ['', Validators.required],
    description: [''],
    isFloater: [false]
  });

  ngOnInit(): void {
    this.loadHolidays();
  }

  get f() { return this.holidayForm.controls; }

  loadHolidays(): void {
    this.holidayService.getHolidays(moment().year()).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.holidays.set(res.data || []);
        }else{
          this.holidays.set([]);
          this.toastr.error('Failed to load holidays')
        }
      },
      error: (error) => {
        this.toastr.error('Failed to load holidays')
        console.error('Error loading holidays:', error);
      }
    });
  }

  isAdmin(): boolean {
    // return this.authService.isAdmin();
    return true
  }

  openCreateModal(): void {
    this.editingHoliday = null;
    this.holidayForm.reset();
    this.holidayForm.patchValue({ isFloater: false });
    this.submitted = false;
    this.showModal.set(true);
  }

  editHoliday(holiday: Holiday): void {
    this.editingHoliday = holiday;
    this.holidayForm.patchValue({
      holName: holiday.holName,
      holDate: this.formatDateForInput(holiday.holDate),
      description: holiday.description || '',
      isFloater: holiday.isFloater || false
    });
    this.submitted = false;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHoliday = null;
    this.holidayForm.reset();
    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.holidayForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.holidayForm.value;
    const holidayData: CreateHolidayDto = {
      holName: formValue.holName,
      holDate: new Date(formValue.holDate),
      description: formValue.description,
      isFloater: formValue.isFloater
    };

    const operation = this.editingHoliday
      ? this.holidayService.patchHoliday(this.editingHoliday.holId, holidayData)
      : this.holidayService.createHoliday(holidayData);

    operation.subscribe({
      next: (res) => {
        if(res.statusCode === 200){
          this.loadHolidays();
          this.closeModal();
          this.loading = false;
        }else{
          this.toastr.error('Failed to save holiday')
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.toastr.error('Failed to save holiday')
        console.error('Error saving holiday:', error);
        this.loading = false;
      }
    });
  }

  deleteHoliday(holiday: Holiday): void {
    if (confirm(`Are you sure you want to delete "${holiday.holName}"?`)) {
      this.holidayService.deleteHoliday(holiday.holId).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.toastr.success('Holiday deleted');
            this.loadHolidays();
          }else{
            this.toastr.error('Failed to delete holiday')
          }
        },
        error: (error) => {
          this.toastr.error('Failed to delete holiday')
          console.error('Error deleting holiday:', error);
        }
      });
    }
  }

  getUpcomingHolidays(): Holiday[] {
  const today = moment().startOf('day');
  return this.holidays().filter(h => moment(h.holDate).isAfter(today));
  }

  getFloaterHolidays(): Holiday[] {
    return this.holidays().filter(h => h.isFloater);
  }

  isPastHoliday(holiday: Holiday): boolean {
    return moment(holiday.holDate).isBefore(moment(), 'day');
  }

  isTodayHoliday(holiday: Holiday): boolean {
    return moment(holiday.holDate).isSame(moment(), 'day');
  }

  getHolidayStatus(holiday: Holiday): string {
    if (this.isTodayHoliday(holiday)) return 'today';
    if (this.isPastHoliday(holiday)) return 'past';
    return 'upcoming';
  }

  getHolidayStatusText(holiday: Holiday): string {
    if (this.isTodayHoliday(holiday)) return 'Today';
    if (this.isPastHoliday(holiday)) return 'Past';
    return 'Upcoming';
  }

  getDaysUntil(holiday: Holiday): number {
    const today = new Date();
    const holidayDate = new Date(holiday.holDate);
    const diffTime = holidayDate.getTime() - today.getTime();
    return (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1);
  }

  private formatDateForInput(date: Date | string): string {
    return new Date(date).toISOString().split('T')[0];
  }
}