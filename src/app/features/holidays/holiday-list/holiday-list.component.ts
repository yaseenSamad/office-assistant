import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HolidayService } from '../../../core/services/holiday.service';
import { AuthService } from '../../../core/services/auth.service';
import { Holiday, CreateHolidayDto } from '../../../core/models/holiday.model';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="holiday-container">
      <!-- Header Section -->
      <div class="holiday-header">
        <div class="header-content">
          <h1>Company Holidays</h1>
          <p>View all company holidays and important dates</p>
        </div>
        <div class="header-actions" *ngIf="isAdmin()">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="material-icons">add</span>
            Add Holiday
          </button>
        </div>
      </div>

      <!-- Holiday Stats -->
      <div class="holiday-stats" *ngIf="holidays().length > 0">
        <div class="stat-card">
          <div class="stat-number">{{ holidays().length }}</div>
          <div class="stat-label">Total Holidays</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getUpcomingHolidays().length }}</div>
          <div class="stat-label">Upcoming</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getFloaterHolidays().length }}</div>
          <div class="stat-label">Floater Days</div>
        </div>
      </div>

      <!-- Holidays List -->
      <div class="holidays-content">
        <div class="holidays-grid" *ngIf="holidays().length > 0">
          <div class="holiday-card" 
               *ngFor="let holiday of holidays()" 
               [class.past-holiday]="isPastHoliday(holiday)"
               [class.today-holiday]="isTodayHoliday(holiday)">
            
            <div class="holiday-date">
              <div class="date-day">{{ holiday.date | date:'dd' }}</div>
              <div class="date-month">{{ holiday.date | date:'MMM' }}</div>
              <div class="date-year">{{ holiday.date | date:'yyyy' }}</div>
            </div>
            
            <div class="holiday-info">
              <div class="holiday-title">
                {{ holiday.title }}
                <span class="floater-badge" *ngIf="holiday.isFloater">Floater</span>
              </div>
              <div class="holiday-description" *ngIf="holiday.description">
                {{ holiday.description }}
              </div>
              <div class="holiday-meta">
                <span class="holiday-status" [class]="getHolidayStatus(holiday)">
                  {{ getHolidayStatusText(holiday) }}
                </span>
                <span class="holiday-days" *ngIf="!isPastHoliday(holiday) && !isTodayHoliday(holiday)">
                  {{ getDaysUntil(holiday) }} days to go
                </span>
              </div>
            </div>
            
            <div class="holiday-actions" *ngIf="isAdmin()">
              <button class="action-btn edit-btn" (click)="editHoliday(holiday)" title="Edit Holiday">
                <span class="material-icons">edit</span>
              </button>
              <button class="action-btn delete-btn" (click)="deleteHoliday(holiday)" title="Delete Holiday">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="holidays().length === 0">
          <div class="empty-icon">📅</div>
          <h3>No Holidays</h3>
          <p>There are no holidays scheduled at the moment.</p>
          <button class="btn btn-primary" *ngIf="isAdmin()" (click)="openCreateModal()">
            Add First Holiday
          </button>
        </div>
      </div>

      <!-- Create/Edit Holiday Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingHoliday ? 'Edit Holiday' : 'Add New Holiday' }}</h2>
            <button class="close-btn" (click)="closeModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form [formGroup]="holidayForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="title" class="form-label">Holiday Name *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="form-control"
                [class.is-invalid]="submitted && f['title'].errors"
                placeholder="Enter holiday name"
              />
              <div class="invalid-feedback" *ngIf="submitted && f['title'].errors">
                <div *ngIf="f.title.errors['required']">Holiday name is required</div>
              </div>
            </div>

            <div class="form-group">
              <label for="date" class="form-label">Date *</label>
              <input
                type="date"
                id="date"
                formControlName="date"
                class="form-control"
                [class.is-invalid]="submitted && f['date'].errors"
              />
              <div class="invalid-feedback" *ngIf="submitted && f['date'].errors">
                <div *ngIf="f.date.errors['required']">Date is required</div>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"
                placeholder="Enter holiday description (optional)"
              ></textarea>
            </div>

            <div class="form-group">
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  id="isFloater"
                  formControlName="isFloater"
                  class="form-checkbox"
                />
                <label for="isFloater" class="checkbox-label">
                  Floater Holiday
                  <span class="checkbox-help">Flexible holiday that can be taken on different dates</span>
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                {{ loading ? 'Saving...' : (editingHoliday ? 'Update Holiday' : 'Add Holiday') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .holiday-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    /* Header */
    .holiday-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
    }

    .header-content h1 {
      margin: 0 0 var(--space-1) 0;
      color: var(--neutral-800);
      font-size: var(--font-size-2xl);
    }

    .header-content p {
      margin: 0;
      color: var(--neutral-600);
    }

    .header-actions .btn {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    /* Holiday Stats */
    .holiday-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .stat-card {
      background: white;
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .stat-number {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary);
      margin-bottom: var(--space-1);
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Holidays Grid */
    .holidays-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--space-3);
    }

    .holiday-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .holiday-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .holiday-card.past-holiday {
      opacity: 0.6;
      background: var(--neutral-100);
    }

    .holiday-card.today-holiday {
      border-left: 4px solid var(--success);
      background: rgba(76, 175, 80, 0.05);
    }

    .holiday-date {
      text-align: center;
      background: var(--primary);
      color: white;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      min-width: 70px;
    }

    .date-day {
      display: block;
      font-size: var(--font-size-xl);
      font-weight: 700;
      line-height: 1;
    }

    .date-month {
      display: block;
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      margin-top: var(--space-1);
    }

    .date-year {
      display: block;
      font-size: var(--font-size-xs);
      opacity: 0.8;
    }

    .holiday-info {
      flex: 1;
    }

    .holiday-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--neutral-800);
      margin-bottom: var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .floater-badge {
      background: var(--accent);
      color: white;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
    }

    .holiday-description {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-2);
      line-height: 1.4;
    }

    .holiday-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .holiday-status {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-weight: 500;
      text-transform: uppercase;
      font-size: var(--font-size-xs);
    }

    .holiday-status.upcoming {
      background: rgba(25, 118, 210, 0.1);
      color: var(--primary);
    }

    .holiday-status.today {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success);
    }

    .holiday-status.past {
      background: rgba(158, 158, 158, 0.1);
      color: var(--neutral-600);
    }

    .holiday-days {
      color: var(--neutral-600);
      font-weight: 500;
    }

    .holiday-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .action-btn {
      background: none;
      border: none;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn .material-icons {
      font-size: 18px;
    }

    .edit-btn:hover {
      background: rgba(25, 118, 210, 0.1);
      color: var(--primary);
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--space-7) var(--space-4);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-3);
    }

    .empty-state h3 {
      color: var(--neutral-800);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-3);
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--neutral-800);
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }

    .close-btn:hover {
      background: var(--neutral-100);
    }

    .modal-content form {
      padding: var(--space-4);
    }

    .form-group {
      margin-bottom: var(--space-3);
    }

    .form-label {
      display: block;
      margin-bottom: var(--space-1);
      font-weight: 500;
      color: var(--neutral-700);
    }

    .form-control {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-sm);
      font-family: inherit;
      transition: border-color var(--transition-fast);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }

    .is-invalid {
      border-color: var(--error);
    }

    .invalid-feedback {
      display: block;
      color: var(--error);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }

    .checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .form-checkbox {
      margin-top: 2px;
    }

    .checkbox-label {
      font-weight: 500;
      color: var(--neutral-700);
      cursor: pointer;
    }

    .checkbox-help {
      display: block;
      font-weight: 400;
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      margin-top: var(--space-1);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--neutral-200);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .holiday-container {
        padding: var(--space-2);
      }

      .holiday-header {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }

      .holidays-grid {
        grid-template-columns: 1fr;
      }

      .holiday-card {
        flex-direction: column;
        text-align: center;
      }

      .holiday-actions {
        flex-direction: row;
        justify-content: center;
      }

      .modal-overlay {
        padding: var(--space-2);
      }
    }
  `]
})
export class HolidayListComponent implements OnInit {
  private holidayService = inject(HolidayService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  holidays = signal<Holiday[]>([]);
  showModal = signal(false);
  loading = false;
  submitted = false;
  editingHoliday: Holiday | null = null;

  holidayForm: FormGroup = this.formBuilder.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    description: [''],
    isFloater: [false]
  });

  ngOnInit(): void {
    this.loadHolidays();
  }

  get f() { return this.holidayForm.controls; }

  loadHolidays(): void {
    this.holidayService.getHolidays().subscribe({
      next: (holidays) => {
        this.holidays.set(holidays);
      },
      error: (error) => {
        console.error('Error loading holidays:', error);
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
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
      title: holiday.title,
      date: this.formatDateForInput(holiday.date),
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
      title: formValue.title,
      date: new Date(formValue.date),
      description: formValue.description,
      isFloater: formValue.isFloater
    };

    const operation = this.editingHoliday
      ? this.holidayService.updateHoliday(this.editingHoliday.id, holidayData)
      : this.holidayService.createHoliday(holidayData);

    operation.subscribe({
      next: () => {
        this.loadHolidays();
        this.closeModal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving holiday:', error);
        this.loading = false;
      }
    });
  }

  deleteHoliday(holiday: Holiday): void {
    if (confirm(`Are you sure you want to delete "${holiday.title}"?`)) {
      this.holidayService.deleteHoliday(holiday.id).subscribe({
        next: () => {
          this.loadHolidays();
        },
        error: (error) => {
          console.error('Error deleting holiday:', error);
        }
      });
    }
  }

  getUpcomingHolidays(): Holiday[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.holidays().filter(h => h.date >= today);
  }

  getFloaterHolidays(): Holiday[] {
    return this.holidays().filter(h => h.isFloater);
  }

  isPastHoliday(holiday: Holiday): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holiday.date < today;
  }

  isTodayHoliday(holiday: Holiday): boolean {
    const today = new Date();
    const holidayDate = new Date(holiday.date);
    return today.toDateString() === holidayDate.toDateString();
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
    const holidayDate = new Date(holiday.date);
    const diffTime = holidayDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
}