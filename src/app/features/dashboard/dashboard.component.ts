import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { HolidayService } from '../../core/services/holiday.service';

interface Holiday {
  id: string;
  name: string;
  date: Date;
  isFloater: boolean;
  daysLeft: number;
}

interface BlogPost {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  type: 'birthday' | 'anniversary' | 'newJoinee';
  date: Date;
  yearsCompleted?: number;
}

interface LeaveBalance {
  type: string;
  available: number;
  used: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    /* Welcome Banner */
    .welcome-banner {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-content h1 {
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: 600;
    }

    .welcome-subtitle {
      margin: var(--space-1) 0 0 0;
      opacity: 0.9;
    }

    .weather-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .weather-icon {
      font-size: 2rem;
    }

    .weather-details {
      display: flex;
      flex-direction: column;
    }

    .temperature {
      font-size: var(--font-size-lg);
      font-weight: 600;
    }

    .weather-desc {
      font-size: var(--font-size-sm);
      opacity: 0.9;
    }

    /* Holiday Banner */
    .holiday-banner {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
      color: white;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .holiday-content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .holiday-icon {
      font-size: 2rem;
    }

    .holiday-details h3 {
      margin: 0;
      font-size: var(--font-size-lg);
    }

    .holiday-details p {
      margin: var(--space-1) 0 0 0;
      opacity: 0.9;
    }

    .holiday-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: inline-block;
    }

    .holiday-date {
      text-align: center;
      background: rgba(255, 255, 255, 0.2);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      min-width: 60px;
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
      opacity: 0.9;
    }

    /* Quick Actions Section */
    .quick-actions-section {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .clock-section {
      background: white;
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .clock-display {
      text-align: center;
      margin-bottom: var(--space-3);
    }

    .current-time {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary);
      margin-bottom: var(--space-1);
    }

    .clock-status {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .clock-status.clocked-in {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success);
    }

    .clock-status.clocked-out {
      background: rgba(158, 158, 158, 0.1);
      color: var(--neutral-600);
    }

    .clock-actions {
      text-align: center;
    }

    .clock-btn {
      width: 100%;
      padding: var(--space-3);
      font-weight: 600;
      margin-bottom: var(--space-2);
    }

    .work-hours {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--space-3);
    }

    .quick-action-card {
      background: white;
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      color: var(--neutral-800);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all var(--transition-fast);
    }

    .quick-action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: var(--space-2);
    }

    .action-text {
      font-weight: 500;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-4);
    }

    .dashboard-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }

    .card-header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
      color: var(--neutral-800);
    }

    .view-all-link {
      color: var(--primary);
      font-size: var(--font-size-sm);
      text-decoration: none;
    }

    /* Blog Section */
    .blog-form {
      margin-bottom: var(--space-4);
      padding: var(--space-3);
      background: var(--neutral-100);
      border-radius: var(--radius-md);
    }

    .blog-textarea {
      width: 100%;
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-sm);
      padding: var(--space-2);
      font-family: inherit;
      resize: vertical;
      margin-bottom: var(--space-2);
    }

    .blog-form-actions {
      text-align: right;
    }

    .blog-posts {
      max-height: 400px;
      overflow-y: auto;
    }

    .blog-post {
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--neutral-200);
    }

    .blog-post:last-child {
      border-bottom: none;
    }

    .post-header {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .post-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: var(--space-2);
    }

    .post-meta h4 {
      margin: 0;
      font-size: var(--font-size-md);
    }

    .post-time {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .post-content {
      margin-bottom: var(--space-2);
      line-height: 1.5;
    }

    .post-actions {
      display: flex;
      gap: var(--space-3);
    }

    .post-action {
      background: none;
      border: none;
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
      cursor: pointer;
    }

    .post-action:hover {
      background: var(--neutral-100);
    }

    /* Leave Balance */
    .leave-balances {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .balance-item {
      padding: var(--space-2);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .balance-type {
      font-weight: 500;
    }

    .balance-available {
      color: var(--primary);
      font-weight: 600;
    }

    .balance-bar {
      height: 6px;
      background: var(--neutral-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .balance-progress {
      height: 100%;
      background: var(--primary);
      transition: width var(--transition-normal);
    }

    /* Celebrations */
    .celebration-section {
      margin-bottom: var(--space-4);
    }

    .celebration-section h3 {
      font-size: var(--font-size-md);
      margin-bottom: var(--space-2);
      color: var(--neutral-700);
    }

    .celebration-item {
      display: flex;
      align-items: center;
      padding: var(--space-2);
      margin-bottom: var(--space-2);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
    }

    .celebration-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .celebration-details {
      flex: 1;
    }

    .celebration-details h4 {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .celebration-details p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    /* Today's Leave */
    .leave-item {
      display: flex;
      align-items: center;
      padding: var(--space-2);
      margin-bottom: var(--space-2);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
    }

    .leave-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--warning);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .leave-details {
      flex: 1;
    }

    .leave-details h4 {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .leave-details p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .leave-status {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
    }

    .leave-status.approved {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success);
    }

    /* Upcoming Holidays */
    .holiday-item {
      display: flex;
      align-items: center;
      padding: var(--space-2);
      margin-bottom: var(--space-2);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
    }

    .holiday-date-small {
      width: 50px;
      text-align: center;
      margin-right: var(--space-2);
      background: var(--primary-light);
      color: white;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
    }

    .holiday-date-small .date-day {
      display: block;
      font-weight: 700;
      line-height: 1;
    }

    .holiday-date-small .date-month {
      display: block;
      font-size: var(--font-size-xs);
      text-transform: uppercase;
    }

    .holiday-info {
      flex: 1;
    }

    .holiday-info h4 {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .holiday-info p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    /* Empty States */
    .no-celebrations, .no-leave {
      text-align: center;
      padding: var(--space-4);
      color: var(--neutral-600);
    }

    .no-celebrations .material-icons, .no-leave .material-icons {
      font-size: 3rem;
      margin-bottom: var(--space-2);
      opacity: 0.5;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .quick-actions-section {
        grid-template-columns: 1fr;
      }
      
      .welcome-banner, .holiday-banner {
        flex-direction: column;
        text-align: center;
        gap: var(--space-2);
      }
      
      .dashboard-container {
        padding: var(--space-2);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private holidayService = inject(HolidayService);
  
  user: User | null = null;
  currentTime: string = '';
  clockStatus: 'clocked-in' | 'clocked-out' = 'clocked-out';
  workingHours: string = '0h 0m';
  showBlogForm: boolean = false;
  newBlogContent: string = '';

  // Holiday data
  nextHoliday: Holiday | null = null;
  // upcomingHolidays: Holiday[] = [];

  blogPosts: BlogPost[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      content: 'Excited to announce our Q2 results! Great work everyone on achieving our targets. 🎉',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      comments: 5
    },
    {
      id: '2',
      author: 'Mike Chen',
      content: 'Don\'t forget about the team building event this Friday. Looking forward to seeing everyone there!',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 8,
      comments: 3
    }
  ];

  leaveBalances: LeaveBalance[] = [
    { type: 'Annual Leave', available: 18, used: 7, total: 25 },
    { type: 'Sick Leave', available: 8, used: 2, total: 10 },
    { type: 'Personal Leave', available: 3, used: 2, total: 5 }
  ];

  birthdays: Employee[] = [
    { id: '1', name: 'Alex Rodriguez', department: 'Engineering', type: 'birthday', date: new Date() }
  ];

  anniversaries: Employee[] = [
    { id: '2', name: 'Jennifer Smith', department: 'Marketing', type: 'anniversary', date: new Date(), yearsCompleted: 3 }
  ];

  newJoinees: Employee[] = [
    { id: '3', name: 'David Kim', department: 'Sales', type: 'newJoinee', date: new Date() }
  ];

  todaysLeave: any[] = [
    { name: 'Emma Wilson', department: 'HR', leaveType: 'Annual Leave', status: 'approved' }
  ];

  upcomingHolidays: any[] = [
    {
      id: '2',
      name: 'Memorial Day',
      date: new Date('2025-05-26'),
      isFloater: false,
      daysLeft: 15
    },
    {
      id: '3',
      name: 'Personal Day',
      date: new Date('2025-06-15'),
      isFloater: true,
      daysLeft: 35
    }
  ];

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  loadHolidays(): void {
    this.holidayService.getUpcomingHolidays(5).subscribe({
      next: (holidays) => {
        this.upcomingHolidays = holidays.map(h => ({
          ...h,
          name: h.title,
          daysLeft: this.calculateDaysUntil(h.date)
        }));
        this.nextHoliday = this.upcomingHolidays.length > 0 ? this.upcomingHolidays[0] : null;
      },
      error: (error) => {
        console.error('Error loading holidays:', error);
      }
    });
  }

  calculateDaysUntil(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  toggleClock(): void {
    this.clockStatus = this.clockStatus === 'clocked-out' ? 'clocked-in' : 'clocked-out';
    if (this.clockStatus === 'clocked-in') {
      // Start working hours counter
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

  publishBlog(): void {
    if (this.newBlogContent.trim()) {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        author: `${this.user?.firstName} ${this.user?.lastName}`,
        content: this.newBlogContent.trim(),
        timestamp: new Date(),
        likes: 0,
        comments: 0
      };
      this.blogPosts.unshift(newPost);
      this.newBlogContent = '';
      this.showBlogForm = false;
    }
  }

  likePost(post: BlogPost): void {
    post.likes++;
  }

  getDaysUntil(holiday: Holiday): string {
    const today = new Date();
    const holidayDate = new Date(holiday.date);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days to go`;
    return 'Past';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }
}