import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import moment from 'moment';

interface Policy {
  policyId: number;
  title: string;
  description: string;
  documentUrl: string;
  updatedAt: string;
  updatedBy: string;
}

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PolicyComponent implements OnInit {
  policies: Policy[] = [];
  userRole: 'EMPLOYEE' | 'HR' | 'ADMIN' = 'EMPLOYEE';

  ngOnInit(): void {
    // Mock data for UI
    this.policies = [
      {
        policyId: 1,
        title: 'Leave Policy',
        description: 'Rules about leave types and approvals.',
        documentUrl: '/docs/leave-policy.pdf',
        updatedAt: '2025-09-10T12:30:00',
        updatedBy: 'HR Team'
      },
      {
        policyId: 2,
        title: 'Code of Conduct',
        description: 'Guidelines for workplace behavior.',
        documentUrl: '/docs/code-of-conduct.pdf',
        updatedAt: '2025-09-01T15:00:00',
        updatedBy: 'Admin'
      }
    ];
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  canEdit(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'HR';
  }
}
