import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Welcome, {{ user?.firstName }}!</h1>
        <p class="date">{{ today | date:'fullDate' }}</p>
      </header>

      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">schedule</span>
          </div>
          <div class="stat-content">
            <h3>8:42 hrs</h3>
            <p>Today's Hours</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">event_available</span>
          </div>
          <div class="stat-content">
            <h3>14 days</h3>
            <p>Remaining Leave</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">pending_actions</span>
          </div>
          <div class="stat-content">
            <h3>2</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">celebration</span>
          </div>
          <div class="stat-content">
            <h3>3</h3>
            <p>Upcoming Holidays</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h2>Recent Posts</h2>
                <a routerLink="/posts" class="btn btn-outline">View All</a>
              </div>
              <div class="card-body">
                <div class="post">
                  <div class="post-avatar">JD</div>
                  <div class="post-content">
                    <div class="post-header">
                      <h4>John Doe</h4>
                      <span class="post-time">2 hours ago</span>
                    </div>
                    <p>Just finished the quarterly report, great teamwork everyone!</p>
                    <div class="post-actions">
                      <button class="post-action">
                        <span class="material-icons">thumb_up</span> 5
                      </button>
                      <button class="post-action">
                        <span class="material-icons">comment</span> 2
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="post">
                  <div class="post-avatar">SM</div>
                  <div class="post-content">
                    <div class="post-header">
                      <h4>Sarah Miller</h4>
                      <span class="post-time">Yesterday</span>
                    </div>
                    <p>Reminder: Team building event this Friday. Don't forget to RSVP!</p>
                    <div class="post-actions">
                      <button class="post-action">
                        <span class="material-icons">thumb_up</span> 12
                      </button>
                      <button class="post-action">
                        <span class="material-icons">comment</span> 8
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <a routerLink="/attendance" class="quick-action">
                    <span class="material-icons">login</span>
                    <span>Mark Attendance</span>
                  </a>
                  <a routerLink="/leave/request" class="quick-action">
                    <span class="material-icons">schedule</span>
                    <span>Request Leave</span>
                  </a>
                  <a routerLink="/posts/create" class="quick-action">
                    <span class="material-icons">post_add</span>
                    <span>Create Post</span>
                  </a>
                  <a routerLink="/holidays" class="quick-action">
                    <span class="material-icons">event</span>
                    <span>View Holidays</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h2>Upcoming Holidays</h2>
              </div>
              <div class="card-body">
                <div class="holiday-list">
                  <div class="holiday-item">
                    <div class="holiday-date">
                      <div class="month">May</div>
                      <div class="day">15</div>
                    </div>
                    <div class="holiday-info">
                      <h4>Memorial Day</h4>
                      <p>Monday</p>
                    </div>
                  </div>
                  
                  <div class="holiday-item">
                    <div class="holiday-date">
                      <div class="month">Jul</div>
                      <div class="day">4</div>
                    </div>
                    <div class="holiday-info">
                      <h4>Independence Day</h4>
                      <p>Thursday</p>
                    </div>
                  </div>
                  
                  <div class="holiday-item">
                    <div class="holiday-date">
                      <div class="month">Sep</div>
                      <div class="day">2</div>
                    </div>
                    <div class="holiday-info">
                      <h4>Labor Day</h4>
                      <p>Monday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: var(--space-4);
    }
    
    .page-header h1 {
      margin-bottom: var(--space-1);
    }
    
    .date {
      color: var(--neutral-600);
    }
    
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    
    .stat-card {
      background-color: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: var(--space-3);
      display: flex;
      align-items: center;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
    }
    
    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-3);
    }
    
    .stat-icon .material-icons {
      color: var(--primary);
      font-size: 24px;
    }
    
    .stat-content h3 {
      margin: 0;
      font-size: var(--font-size-xl);
      line-height: 1.2;
    }
    
    .stat-content p {
      margin: 0;
      color: var(--neutral-600);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
      margin-bottom: var(--space-3);
    }
    
    .card-header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
    }
    
    .post {
      display: flex;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .post:last-child {
      border-bottom: none;
    }
    
    .post-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: var(--space-3);
      flex-shrink: 0;
    }
    
    .post-content {
      flex: 1;
    }
    
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-1);
    }
    
    .post-header h4 {
      margin: 0;
      font-size: var(--font-size-md);
    }
    
    .post-time {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }
    
    .post-actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }
    
    .post-action {
      background: none;
      border: none;
      color: var(--neutral-700);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }
    
    .post-action:hover {
      background-color: var(--neutral-100);
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
    }
    
    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-3);
      background-color: var(--neutral-100);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--neutral-800);
      transition: all var(--transition-fast);
      text-align: center;
    }
    
    .quick-action .material-icons {
      font-size: 24px;
      margin-bottom: var(--space-1);
      color: var(--primary);
    }
    
    .quick-action:hover {
      background-color: var(--primary);
      color: white;
    }
    
    .quick-action:hover .material-icons {
      color: white;
    }
    
    .holiday-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    
    .holiday-item {
      display: flex;
      align-items: center;
    }
    
    .holiday-date {
      width: 60px;
      height: 60px;
      background-color: var(--primary-light);
      color: white;
      border-radius: var(--radius-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-3);
      flex-shrink: 0;
    }
    
    .holiday-date .month {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
    }
    
    .holiday-date .day {
      font-size: var(--font-size-xl);
      font-weight: 700;
    }
    
    .holiday-info h4 {
      margin: 0;
      font-size: var(--font-size-md);
    }
    
    .holiday-info p {
      margin: 0;
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  user: User | null = null;
  today = new Date();
  
  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }
}