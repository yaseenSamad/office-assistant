import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team, CreateTeamDto } from '../../../core/models/team.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="teams-container">
      <!-- Header Section -->
      <div class="teams-header">
        <div class="header-content">
          <h1>Teams</h1>
          <p>Manage and view all company teams</p>
        </div>
        <div class="header-actions" *ngIf="canCreateTeam()">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="material-icons">add</span>
            Create Team
          </button>
        </div>
      </div>

      <!-- Team Stats -->
      <div class="team-stats" *ngIf="teams().length > 0">
        <div class="stat-card">
          <div class="stat-number">{{ teams().length }}</div>
          <div class="stat-label">Total Teams</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getTotalMembers() }}</div>
          <div class="stat-label">Total Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getAverageTeamSize() }}</div>
          <div class="stat-label">Avg Team Size</div>
        </div>
      </div>

      <!-- Teams List -->
      <div class="teams-content">
        <div class="teams-grid" *ngIf="teams().length > 0">
          <div class="team-card" *ngFor="let team of teams()">
            <div class="team-header">
              <div class="team-info">
                <h3 class="team-name">{{ team.name }}</h3>
                <p class="team-description" *ngIf="team.description">{{ team.description }}</p>
              </div>
              <div class="team-actions" *ngIf="canManageTeam()">
                <button class="action-btn edit-btn" (click)="editTeam(team)" title="Edit Team">
                  <span class="material-icons">edit</span>
                </button>
                <button class="action-btn delete-btn" (click)="deleteTeam(team)" title="Delete Team">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>

            <div class="team-leader">
              <div class="leader-info">
                <div class="leader-avatar">
                  {{ getLeaderInitials(team.leader) }}
                </div>
                <div class="leader-details">
                  <span class="leader-label">Team Leader</span>
                  <span class="leader-name">{{ getLeaderName(team.leader) }}</span>
                </div>
              </div>
            </div>

            <div class="team-members">
              <div class="members-header">
                <span class="members-count">{{ team.members.length }} Members</span>
                <button 
                  class="btn btn-sm btn-outline" 
                  *ngIf="canAssignMembers()"
                  (click)="openMembersModal(team)"
                >
                  Manage Members
                </button>
              </div>
              <div class="members-list">
                <div class="member-avatar" 
                     *ngFor="let memberId of team.members.slice(0, 5)" 
                     [title]="getMemberName(memberId)">
                  {{ getMemberInitials(memberId) }}
                </div>
                <div class="more-members" *ngIf="team.members.length > 5">
                  +{{ team.members.length - 5 }}
                </div>
              </div>
            </div>

            <div class="team-meta">
              <span class="created-date">Created {{ team.createdAt | date:'MMM dd, yyyy' }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="teams().length === 0">
          <div class="empty-icon">👥</div>
          <h3>No Teams</h3>
          <p>There are no teams created yet.</p>
          <button class="btn btn-primary" *ngIf="canCreateTeam()" (click)="openCreateModal()">
            Create First Team
          </button>
        </div>
      </div>

      <!-- Create/Edit Team Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingTeam ? 'Edit Team' : 'Create New Team' }}</h2>
            <button class="close-btn" (click)="closeModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name" class="form-label">Team Name *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                [class.is-invalid]="submitted && f['name'].errors"
                placeholder="Enter team name"
              />
              <div class="invalid-feedback" *ngIf="submitted && f['name'].errors">
                <div *ngIf="f.name.errors['required']">Team name is required</div>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"
                placeholder="Enter team description (optional)"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="leader" class="form-label">Team Leader *</label>
              <select
                id="leader"
                formControlName="leader"
                class="form-control"
                [class.is-invalid]="submitted && f['leader'].errors"
              >
                <option value="">Select a team leader</option>
                <option *ngFor="let user of users()" [value]="user.id">
                  {{ user.firstName }} {{ user.lastName }} - {{ user.position }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="submitted && f['leader'].errors">
                <div *ngIf="f.leader.errors['required']">Team leader is required</div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                {{ loading ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Manage Members Modal -->
      <div class="modal-overlay" *ngIf="showMembersModal()" (click)="closeMembersModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Manage Team Members - {{ selectedTeam?.name }}</h2>
            <button class="close-btn" (click)="closeMembersModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="members-management">
            <div class="current-members">
              <h3>Current Members ({{ selectedTeam?.members.length }})</h3>
              <div class="member-list">
                <div class="member-item" *ngFor="let memberId of selectedTeam?.members">
                  <div class="member-info">
                    <div class="member-avatar-small">{{ getMemberInitials(memberId) }}</div>
                    <span class="member-name">{{ getMemberName(memberId) }}</span>
                    <span class="member-role" *ngIf="selectedTeam?.leader === memberId">(Leader)</span>
                  </div>
                  <button 
                    class="btn btn-sm btn-error" 
                    *ngIf="selectedTeam?.leader !== memberId"
                    (click)="removeMember(memberId)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="available-members">
              <h3>Add Members</h3>
              <div class="member-list">
                <div class="member-item" *ngFor="let user of getAvailableMembers()">
                  <div class="member-info">
                    <div class="member-avatar-small">{{ getInitials(user.firstName, user.lastName) }}</div>
                    <span class="member-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="member-position">{{ user.position }}</span>
                  </div>
                  <button class="btn btn-sm btn-primary" (click)="addMember(user.id)">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .teams-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-4);
    }

    /* Header */
    .teams-header {
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

    /* Team Stats */
    .team-stats {
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

    /* Teams Grid */
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--space-3);
    }

    .team-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      transition: all var(--transition-fast);
    }

    .team-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }

    .team-name {
      margin: 0 0 var(--space-1) 0;
      color: var(--neutral-800);
      font-size: var(--font-size-lg);
    }

    .team-description {
      margin: 0;
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      line-height: 1.4;
    }

    .team-actions {
      display: flex;
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

    .team-leader {
      margin-bottom: var(--space-3);
      padding: var(--space-2);
      background: var(--neutral-100);
      border-radius: var(--radius-md);
    }

    .leader-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .leader-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: var(--font-size-sm);
    }

    .leader-details {
      display: flex;
      flex-direction: column;
    }

    .leader-label {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      text-transform: uppercase;
      font-weight: 500;
    }

    .leader-name {
      font-weight: 500;
      color: var(--neutral-800);
    }

    .team-members {
      margin-bottom: var(--space-3);
    }

    .members-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .members-count {
      font-weight: 500;
      color: var(--neutral-700);
    }

    .members-list {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: var(--font-size-xs);
    }

    .more-members {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--neutral-400);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: 500;
    }

    .team-meta {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      border-top: 1px solid var(--neutral-200);
      padding-top: var(--space-2);
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
      max-width: 600px;
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

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--neutral-200);
    }

    /* Members Management */
    .members-management {
      padding: var(--space-4);
    }

    .current-members, .available-members {
      margin-bottom: var(--space-4);
    }

    .current-members h3, .available-members h3 {
      margin-bottom: var(--space-2);
      color: var(--neutral-800);
    }

    .member-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .member-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2);
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .member-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: var(--font-size-xs);
    }

    .member-name {
      font-weight: 500;
    }

    .member-role {
      color: var(--primary);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .member-position {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .teams-container {
        padding: var(--space-2);
      }

      .teams-header {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }

      .teams-grid {
        grid-template-columns: 1fr;
      }

      .modal-overlay {
        padding: var(--space-2);
      }
    }
  `]
})
export class TeamListComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  teams = signal<Team[]>([]);
  users = signal<User[]>([]);
  showModal = signal(false);
  showMembersModal = signal(false);
  loading = false;
  submitted = false;
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;

  teamForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    leader: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadTeams();
    this.loadUsers();
  }

  get f() { return this.teamForm.controls; }

  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  canCreateTeam(): boolean {
    return this.authService.isAdmin();
  }

  canManageTeam(): boolean {
    return this.authService.isAdminOrHR();
  }

  canAssignMembers(): boolean {
    return this.authService.isAdminOrHR();
  }

  openCreateModal(): void {
    this.editingTeam = null;
    this.teamForm.reset();
    this.submitted = false;
    this.showModal.set(true);
  }

  editTeam(team: Team): void {
    this.editingTeam = team;
    this.teamForm.patchValue({
      name: team.name,
      description: team.description || '',
      leader: team.leader
    });
    this.submitted = false;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTeam = null;
    this.teamForm.reset();
    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.teamForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.teamForm.value;
    const teamData: CreateTeamDto = {
      name: formValue.name,
      description: formValue.description,
      leader: formValue.leader,
      members: [formValue.leader] // Leader is automatically a member
    };

    const operation = this.editingTeam
      ? this.teamService.updateTeam(this.editingTeam.id, teamData)
      : this.teamService.createTeam(teamData);

    operation.subscribe({
      next: () => {
        this.loadTeams();
        this.closeModal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving team:', error);
        this.loading = false;
      }
    });
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete "${team.name}"?`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error deleting team:', error);
        }
      });
    }
  }

  openMembersModal(team: Team): void {
    this.selectedTeam = team;
    this.showMembersModal.set(true);
  }

  closeMembersModal(): void {
    this.showMembersModal.set(false);
    this.selectedTeam = null;
  }

  addMember(userId: string): void {
    if (this.selectedTeam) {
      this.teamService.addMemberToTeam(this.selectedTeam.id, userId).subscribe({
        next: () => {
          this.loadTeams();
          // Update selected team
          this.selectedTeam = this.teams().find(t => t.id === this.selectedTeam!.id) || null;
        },
        error: (error) => {
          console.error('Error adding member:', error);
        }
      });
    }
  }

  removeMember(userId: string): void {
    if (this.selectedTeam) {
      this.teamService.removeMemberFromTeam(this.selectedTeam.id, userId).subscribe({
        next: () => {
          this.loadTeams();
          // Update selected team
          this.selectedTeam = this.teams().find(t => t.id === this.selectedTeam!.id) || null;
        },
        error: (error) => {
          console.error('Error removing member:', error);
        }
      });
    }
  }

  getAvailableMembers(): User[] {
    if (!this.selectedTeam) return [];
    return this.users().filter(user => !this.selectedTeam!.members.includes(user.id));
  }

  getTotalMembers(): number {
    return this.teams().reduce((total, team) => total + team.members.length, 0);
  }

  getAverageTeamSize(): number {
    if (this.teams().length === 0) return 0;
    return Math.round(this.getTotalMembers() / this.teams().length);
  }

  getLeaderName(leaderId: string): string {
    const leader = this.users().find(u => u.id === leaderId);
    return leader ? `${leader.firstName} ${leader.lastName}` : 'Unknown';
  }

  getLeaderInitials(leaderId: string): string {
    const leader = this.users().find(u => u.id === leaderId);
    return leader ? this.getInitials(leader.firstName, leader.lastName) : '?';
  }

  getMemberName(memberId: string): string {
    const member = this.users().find(u => u.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  }

  getMemberInitials(memberId: string): string {
    const member = this.users().find(u => u.id === memberId);
    return member ? this.getInitials(member.firstName, member.lastName) : '?';
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}