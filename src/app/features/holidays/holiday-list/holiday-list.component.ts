import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HolidayService } from '../../../core/services/holiday.service';
import { AuthService } from '../../../core/services/auth.service';
import { Holiday } from '../../../core/models/holiday.model';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="holiday-container">
      <div class="holiday-header">
        <div class="header-content">
          <h1>Company Holidays</h1>
          <p class="header-subtitle">View all company holidays and important dates</p>
        </div>
        <div class="header-actions" *ngIf="isAdmin()">
          <button class="btn btn-primary" (click)="showCreateForm = true">
            <span class="material-icons">add</span>
            Add Holiday
          </button>
        </div>
      </div>

      <!-- Create Holiday Form -->
      <div class="create-form-overlay" *ngIf="showCreateForm" (click)="closeCreateForm($event)">
        <div class="create-form-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Add New Holiday</h2>
            <button class="close-btn" (click)="showCreateForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form class="holiday-form" (ngSubmit)="createHoliday()" #holidayForm="ngForm">
            <div class="form-group">
              <label for="title" class="form-label">Holiday Name *</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="newHoliday.title"
                name="title"
                class="form-control"
                placeholder="Enter holiday name"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="date" class="form-label">Date *</label>
              <input
                type="date"
                id="date"
                [(ngModel)]="newHoliday.date"
                name="date"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                [(ngModel)]="newHoliday.description"
                name="description"
                class="form-control"
                rows="3"
                placeholder="Enter holiday description (optional)"
              ></textarea>
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="newHoliday.isFloater"
                  name="isFloater"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">Floater Holiday</span>
              </label>
              <small class="form-help">Floater holidays can be taken on any day as per employee choice</small>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="showCreateForm = false">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!holidayForm.valid || isCreating">
                {{ isCreating ? 'Creating...' : 'Create Holiday' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Holiday Stats -->
      <div class="holiday-stats">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ totalHolidays }}</h3>
            <p>Total Holidays</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>{{ upcomingHolidays }}</h3>
            <p>Upcoming</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎈</div>
          <div class="stat-content">
            <h3>{{ floaterHolidays }}</h3>
            <p>Floater Days</p>
          </div>
        </div>
      </div>

      <!-- Holiday List -->
      <div class="holiday-content">
        <div class="holiday-grid" *ngIf="holidays.length > 0; else noHolidays">
          <div class="holiday-card" *ngFor="let holiday of holidays" [class.past]="isPastHoliday(holiday)">
            <div class="holiday-date">
              <span class="date-day">{{ holiday.date | date:'dd' }}</span>
              <span class="date-month">{{ holiday.date | date:'MMM' }}</span>
              <span class="date-year">{{ holiday.date | date:'yyyy' }}</span>
            </div>
            
            <div class="holiday-info">
              <div class="holiday-title-row">
                <h3 class="holiday-title">{{ holiday.title }}</h3>
                <div class="holiday-badges">
                  <span class="badge badge-floater" *ngIf="holiday.isFloater">Floater</span>
                  <span class="badge badge-past" *ngIf="isPastHoliday(holiday)">Past</span>
                  <span class="badge badge-upcoming" *ngIf="isUpcomingHoliday(holiday)">Upcoming</span>
                  <span class="badge badge-today" *ngIf="isToday(holiday)">Today</span>
                </div>
              </div>
              
              <p class="holiday-description" *ngIf="holiday.description">
                {{ holiday.description }}
              </p>
              
              <div class="holiday-meta">
                <span class="days-info" *ngIf="!isPastHoliday(holiday)">
                  {{ getDaysUntil(holiday) }}
                </span>
                <span class="created-by">Added by {{ holiday.createdBy }}</span>
              </div>
            </div>

            <div class="holiday-actions" *ngIf="isAdmin()">
              <button class="action-btn edit-btn" (click)="editHoliday(holiday)">
                <span class="material-icons">edit</span>
              </button>
              <button class="action-btn delete-btn" (click)="deleteHoliday(holiday)">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noHolidays>
          <div class="no-holidays">
            <div class="no-holidays-icon">📅</div>
            <h3>No Holidays</h3>
            <p>There are no holidays scheduled at the moment.</p>
            <button class="btn btn-primary" *ngIf="isAdmin()" (click)="showCreateForm = true">
              Add First Holiday
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .holiday-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .holiday-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
      padding: var(--space-4);
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border-radius: var(--radius-lg);
    }

    .header-content h1 {
      margin: 0 0 var(--space-1) 0;
      font-size: var(--font-size-2xl);
      font-weight: 600;
    }

    .header-subtitle {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions .btn {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }

    .header-actions .btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Create Form Modal */
    .create-form-overlay {
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

    .create-form-modal {
      background: white;
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
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
      color: var(--neutral-600);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }

    .close-btn:hover {
      background: var(--neutral-100);
    }

    .holiday-form {
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

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--neutral-300);
      border-radius: var(--radius-sm);
      margin-right: var(--space-2);
      position: relative;
      transition: all var(--transition-fast);
    }

    .checkbox-input:checked + .checkbox-custom {
      background: var(--primary);
      border-color: var(--primary);
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .checkbox-text {
      font-weight: 500;
    }

    .form-help {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
    }

    .form-actions {
      display: flex;
      gap: var(--space-2);
      justify-content: flex-end;
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--neutral-200);
    }

    /* Holiday Stats */
    .holiday-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .stat-card {
      background: white;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary);
    }

    .stat-content p {
      margin: 0;
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
    }

    /* Holiday Grid */
    .holiday-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
    }

    .holiday-grid {
      display: grid;
      gap: var(--space-3);
    }

    .holiday-card {
      display: flex;
      align-items: center;
      padding: var(--space-4);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
      position: relative;
    }

    .holiday-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .holiday-card.past {
      opacity: 0.7;
      background: var(--neutral-50);
    }

    .holiday-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-right: var(--space-4);
      min-width: 80px;
      padding: var(--space-3);
      background: var(--primary-light);
      color: white;
      border-radius: var(--radius-md);
    }

    .date-day {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      line-height: 1;
    }

    .date-month {
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      margin: var(--space-1) 0;
    }

    .date-year {
      font-size: var(--font-size-xs);
      opacity: 0.9;
    }

    .holiday-info {
      flex: 1;
    }

    .holiday-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2);
    }

    .holiday-title {
      margin: 0;
      font-size: var(--font-size-lg);
      color: var(--neutral-800);
    }

    .holiday-badges {
      display: flex;
      gap: var(--space-1);
      flex-wrap: wrap;
    }

    .badge {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
    }

    .badge-floater {
      background: rgba(255, 152, 0, 0.1);
      color: var(--warning);
      border: 1px solid rgba(255, 152, 0, 0.3);
    }

    .badge-past {
      background: rgba(158, 158, 158, 0.1);
      color: var(--neutral-600);
    }

    .badge-upcoming {
      background: rgba(25, 118, 210, 0.1);
      color: var(--primary);
    }

    .badge-today {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success);
    }

    .holiday-description {
      margin: 0 0 var(--space-2) 0;
      color: var(--neutral-600);
      line-height: 1.5;
    }

    .holiday-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    .days-info {
      font-weight: 500;
      color: var(--primary);
    }

    .holiday-actions {
      display: flex;
      gap: var(--space-1);
    }

    .action-btn {
      background: none;
      border: none;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-btn {
      color: var(--primary);
    }

    .edit-btn:hover {
      background: rgba(25, 118, 210, 0.1);
    }

    .delete-btn {
      color: var(--error);
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    /* No Holidays State */
    .no-holidays {
      text-align: center;
      padding: var(--space-8);
      color: var(--neutral-600);
    }

    .no-holidays-icon {
      font-size: 4rem;
      margin-bottom: var(--space-3);
      opacity: 0.5;
    }

    .no-holidays h3 {
      margin-bottom: var(--space-2);
      color: var(--neutral-700);
    }

    .no-holidays p {
      margin-bottom: var(--space-4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .holiday-header {
        flex-direction: column;
        gap: var(--space-3);
        text-align: center;
      }

      .holiday-card {
        flex-direction: column;
        text-align: center;
      }

      .holiday-date {
        margin-right: 0;
        margin-bottom: var(--space-3);
      }

      .holiday-title-row {
        flex-direction: column;
        gap: var(--space-2);
        text-align: center;
      }

      .holiday-meta {
        flex-direction: column;
        gap: var(--space-1);
        text-align: center;
      }
    }
  `]
})
export class HolidayListComponent implements OnInit {
  private holidayService = inject(HolidayService);
  private authService = inject(AuthService);

  holidays: Holiday[] = [];
  showCreateForm = false;
  isCreating = false;
  
  newHoliday = {
    title: '',
    description: '',
    date: '',
    isFloater: false
  };

  // Stats
  totalHolidays = 0;
  upcomingHolidays = 0;
  floaterHolidays = 0;

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.holidayService.getHolidays().subscribe(holidays => {
      this.holidays = holidays;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    const today = new Date();
    this.totalHolidays = this.holidays.length;
    this.upcomingHolidays = this.holidays.filter(h => h.date >= today).length;
    this.floaterHolidays = this.holidays.filter(h => h.isFloater).length;
  }

  createHoliday(): void {
    if (!this.newHoliday.title || !this.newHoliday.date) {
      return;
    }

    this.isCreating = true;
    
    const holidayData = {
      title: this.newHoliday.title,
      description: this.newHoliday.description || undefined,
      date: new Date(this.newHoliday.date),
      isFloater: this.newHoliday.isFloater
    };

    this.holidayService.createHoliday(holidayData).subscribe({
      next: () => {
        this.loadHolidays();
        this.resetForm();
        this.showCreateForm = false;
        this.isCreating = false;
      },
      error: () => {
        this.isCreating = false;
      }
    });
  }

  resetForm(): void {
    this.newHoliday = {
      title: '',
      description: '',
      date: '',
      isFloater: false
    };
  }

  closeCreateForm(event: Event): void {
    if (event.target === event.currentTarget) {
      this.showCreateForm = false;
    }
  }

  editHoliday(holiday: Holiday): void {
    // TODO: Implement edit functionality
    console.log('Edit holiday:', holiday);
  }

  deleteHoliday(holiday: Holiday): void {
    if (confirm(`Are you sure you want to delete "${holiday.title}"?`)) {
      this.holidayService.deleteHoliday(holiday.id).subscribe(() => {
        this.loadHolidays();
      });
    }
  }

  isPastHoliday(holiday: Holiday): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate < today;
  }

  isUpcomingHoliday(holiday: Holiday): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate > today;
  }

  isToday(holiday: Holiday): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === today.getTime();
  }

  getDaysUntil(holiday: Holiday): string {
    const today = new Date();
    const holidayDate = new Date(holiday.date);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days to go`;
    return '';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}