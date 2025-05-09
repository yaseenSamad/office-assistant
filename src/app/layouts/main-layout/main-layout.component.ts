import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- Main Header -->
      <header class="app-header">
        <div class="header-left">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <span class="material-icons">{{ isSidebarOpen() ? 'menu_open' : 'menu' }}</span>
          </button>
          <div class="logo">
            <a routerLink="/dashboard">HR Management</a>
          </div>
        </div>
        <div class="header-right">
          <div class="user-dropdown" (click)="toggleUserMenu()" (clickOutside)="isUserMenuOpen.set(false)">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              <span class="user-role">{{ formatRole(currentUser?.role) }}</span>
            </div>
            <div class="avatar">
              {{ getInitials(currentUser?.firstName, currentUser?.lastName) }}
            </div>
            <div class="dropdown-menu" *ngIf="isUserMenuOpen()">
              <a routerLink="/profile" class="dropdown-item">
                <span class="material-icons">person</span>
                Profile
              </a>
              <a routerLink="/profile/settings" class="dropdown-item">
                <span class="material-icons">settings</span>
                Settings
              </a>
              <a href="javascript:void(0)" class="dropdown-item" (click)="logout()">
                <span class="material-icons">logout</span>
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="app-body">
        <!-- Sidebar -->
        <aside class="app-sidebar" [class.open]="isSidebarOpen()">
          <nav class="sidebar-nav">
            <ul>
              <li>
                <a routerLink="/dashboard" routerLinkActive="active">
                  <span class="material-icons">dashboard</span>
                  Dashboard
                </a>
              </li>
              
              <li *ngIf="isAdmin()">
                <a routerLink="/user-management" routerLinkActive="active">
                  <span class="material-icons">people</span>
                  User Management
                </a>
              </li>
              
              <li>
                <a routerLink="/holidays" routerLinkActive="active">
                  <span class="material-icons">event</span>
                  Holidays
                </a>
              </li>
              
              <li>
                <a routerLink="/leave" routerLinkActive="active">
                  <span class="material-icons">time_to_leave</span>
                  Leave
                </a>
              </li>
              
              <li>
                <a routerLink="/posts" routerLinkActive="active">
                  <span class="material-icons">forum</span>
                  Posts
                </a>
              </li>
              
              <li>
                <a routerLink="/attendance" routerLinkActive="active">
                  <span class="material-icons">check_circle</span>
                  Attendance
                </a>
              </li>
              
              <li>
                <a routerLink="/policies" routerLinkActive="active">
                  <span class="material-icons">policy</span>
                  Policies
                </a>
              </li>
              
              <li>
                <a routerLink="/teams" routerLinkActive="active">
                  <span class="material-icons">groups</span>
                  Teams
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .app-header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
      background-color: white;
      box-shadow: var(--shadow-sm);
      z-index: 10;
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
    }

    .menu-toggle {
      background: none;
      border: none;
      font-size: var(--font-size-lg);
      cursor: pointer;
      color: var(--neutral-700);
      margin-right: var(--space-3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      font-size: var(--font-size-xl);
      font-weight: 500;
    }

    .logo a {
      color: var(--primary);
      text-decoration: none;
    }

    .user-dropdown {
      position: relative;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition: background-color var(--transition-fast);
    }

    .user-dropdown:hover {
      background-color: var(--neutral-100);
    }

    .user-info {
      margin-right: var(--space-2);
      text-align: right;
    }

    .user-name {
      display: block;
      font-weight: 500;
      line-height: 1.2;
    }

    .user-role {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background-color: white;
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-md);
      min-width: 200px;
      z-index: 100;
      animation: fadeIn var(--transition-fast);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      padding: var(--space-2) var(--space-3);
      color: var(--neutral-800);
      text-decoration: none;
      transition: background-color var(--transition-fast);
    }

    .dropdown-item:hover {
      background-color: var(--neutral-100);
    }

    .dropdown-item .material-icons {
      margin-right: var(--space-2);
      font-size: 20px;
    }

    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .app-sidebar {
      width: 260px;
      background-color: white;
      box-shadow: var(--shadow-sm);
      z-index: 5;
      transition: transform var(--transition-normal);
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .app-sidebar {
        position: absolute;
        top: 64px;
        left: 0;
        bottom: 0;
        transform: translateX(-100%);
      }

      .app-sidebar.open {
        transform: translateX(0);
      }
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin: var(--space-1) 0;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      color: var(--neutral-700);
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: all var(--transition-fast);
    }

    .sidebar-nav a.active {
      color: var(--primary);
      background-color: rgba(25, 118, 210, 0.05);
      border-left-color: var(--primary);
    }

    .sidebar-nav a:hover:not(.active) {
      background-color: var(--neutral-100);
    }

    .sidebar-nav .material-icons {
      margin-right: var(--space-3);
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
      background-color: var(--neutral-100);
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  
  currentUser: User | null = null;
  isSidebarOpen = signal(window.innerWidth > 768);
  isUserMenuOpen = signal(false);
  
  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }
  
  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return 'U';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
  
  formatRole(role?: UserRole): string {
    if (!role) return '';
    return role.charAt(0) + role.slice(1).toLowerCase();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  isHR(): boolean {
    return this.authService.isHR();
  }
}