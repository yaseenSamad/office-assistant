import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="employees-container">
      <!-- Header Section -->
      <div class="employees-header">
        <div class="header-content">
          <h1>Employees</h1>
          <p>Manage and view all company employees</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterEmployees()"
              placeholder="Search employees..."
              class="search-input"
            />
            <span class="material-icons search-icon">search</span>
          </div>
          <select [(ngModel)]="selectedDepartment" (change)="filterEmployees()" class="filter-select">
            <option value="">All Departments</option>
            <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
          </select>
          <select [(ngModel)]="selectedRole" (change)="filterEmployees()" class="filter-select">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="HR">HR</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>
      </div>

      <!-- Employee Stats -->
      <div class="employee-stats">
        <div class="stat-card">
          <div class="stat-number">{{ employees().length }}</div>
          <div class="stat-label">Total Employees</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getEmployeesByRole('ADMIN').length }}</div>
          <div class="stat-label">Admins</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getEmployeesByRole('HR').length }}</div>
          <div class="stat-label">HR</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getEmployeesByRole('EMPLOYEE').length }}</div>
          <div class="stat-label">Employees</div>
        </div>
      </div>

      <!-- Employees List -->
      <div class="employees-content">
        <div class="employees-grid" *ngIf="filteredEmployees().length > 0">
          <div class="employee-card" *ngFor="let employee of filteredEmployees()">
            <div class="employee-avatar">
              {{ getInitials(employee.firstName, employee.lastName) }}
            </div>
            
            <div class="employee-info">
              <div class="employee-name">
                {{ employee.firstName }} {{ employee.lastName }}
              </div>
              <div class="employee-position">
                {{ employee.position }}
              </div>
              <div class="employee-department">
                {{ employee.department }}
              </div>
            </div>
            
            <div class="employee-details">
              <div class="detail-item">
                <span class="material-icons">email</span>
                <span class="detail-text">{{ employee.email }}</span>
              </div>
              <div class="detail-item" *ngIf="employee.phoneNumber">
                <span class="material-icons">phone</span>
                <span class="detail-text">{{ employee.phoneNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="material-icons">calendar_today</span>
                <span class="detail-text">Joined {{ employee.dateJoined | date:'MMM yyyy' }}</span>
              </div>
            </div>
            
            <div class="employee-role">
              <span class="role-badge" [class]="getRoleClass(employee.role)">
                {{ formatRole(employee.role) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredEmployees().length === 0">
          <div class="empty-icon">👥</div>
          <h3>No Employees Found</h3>
          <p *ngIf="searchTerm || selectedDepartment || selectedRole">
            Try adjusting your search criteria or filters.
          </p>
          <p *ngIf="!searchTerm && !selectedDepartment && !selectedRole">
            No employees are currently registered in the system.
          </p>
          <button class="btn btn-primary" (click)="clearFilters()" *ngIf="searchTerm || selectedDepartment || selectedRole">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employees-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    /* Header */
    .employees-header {
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .search-box {
      position: relative;
    }

    .search-input {
      padding: var(--space-2) var(--space-4) var(--space-2) var(--space-6);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      width: 250px;
    }

    .search-icon {
      position: absolute;
      left: var(--space-2);
      top: 50%;
      transform: translateY(-50%);
      color: var(--neutral-500);
      font-size: 20px;
    }

    .filter-select {
      padding: var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: white;
    }

    /* Employee Stats */
    .employee-stats {
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

    /* Employees Grid */
    .employees-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-3);
    }

    .employee-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      transition: all var(--transition-fast);
      position: relative;
    }

    .employee-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .employee-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-3);
    }

    .employee-info {
      margin-bottom: var(--space-3);
    }

    .employee-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--neutral-800);
      margin-bottom: var(--space-1);
    }

    .employee-position {
      font-size: var(--font-size-md);
      color: var(--neutral-700);
      margin-bottom: var(--space-1);
    }

    .employee-department {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      font-weight: 500;
    }

    .employee-details {
      margin-bottom: var(--space-3);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    .detail-item .material-icons {
      font-size: 18px;
      color: var(--neutral-500);
    }

    .detail-text {
      flex: 1;
    }

    .employee-role {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
    }

    .role-badge {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.admin {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error);
    }

    .role-badge.hr {
      background: rgba(255, 152, 0, 0.1);
      color: var(--warning);
    }

    .role-badge.employee {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success);
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .employees-container {
        padding: var(--space-2);
      }

      .employees-header {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }

      .employees-grid {
        grid-template-columns: 1fr;
      }

      .employee-card {
        padding: var(--space-3);
      }
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  employees = signal<User[]>([]);
  filteredEmployees = signal<User[]>([]);
  searchTerm = '';
  selectedDepartment = '';
  selectedRole = '';
  departments: any[] = [];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.employees.set(users);
        this.filteredEmployees.set(users);
        this.extractDepartments(users);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  extractDepartments(users: User[]): void {
    const depts = [...new Set(users.map(u => u.department).filter(d => d))];
    this.departments = depts.sort();
  }

  filterEmployees(): void {
    let filtered = this.employees();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.position?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term)
      );
    }

    if (this.selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === this.selectedDepartment);
    }

    if (this.selectedRole) {
      filtered = filtered.filter(emp => emp.role === this.selectedRole);
    }

    this.filteredEmployees.set(filtered);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedRole = '';
    this.filteredEmployees.set(this.employees());
  }

  getEmployeesByRole(role: string): User[] {
    return this.employees().filter(emp => emp.role === role);
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  formatRole(role: UserRole): string {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  getRoleClass(role: UserRole): string {
    return role.toLowerCase();
  }
}