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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './',
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
    return this.users().filter(user => !this.selectedTeam!.members.includes(user.userId));
  }

  getTotalMembers(): number {
    return this.teams().reduce((total, team) => total + team.members.length, 0);
  }

  getAverageTeamSize(): number {
    if (this.teams().length === 0) return 0;
    return Math.round(this.getTotalMembers() / this.teams().length);
  }

  getLeaderName(leaderId: string): string {
    const leader = this.users().find(u => u.userId === leaderId);
    return leader ? `${leader.firstName} ${leader.lastName}` : 'Unknown';
  }

  getLeaderInitials(leaderId: string): string {
    const leader = this.users().find(u => u.userId === leaderId);
    return leader ? this.getInitials(leader.firstName, leader.lastName) : '?';
  }

  getMemberName(memberId: string): string {
    const member = this.users().find(u => u.userId === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  }

  getMemberInitials(memberId: string): string {
    const member = this.users().find(u => u.userId === memberId);
    return member ? this.getInitials(member.firstName, member.lastName) : '?';
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}