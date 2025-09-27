import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';

interface Team {
  teamId: string;
  teamName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

interface TeamMember {
  teamMemberId: string;
  teamId: string;
  userId: string;
  roleInTeam: 'Manager' | 'Lead' | 'Member';
  joinedAt: string;
  user?: User;
}

interface CreateTeamRequest {
  teamName: string;
  description?: string;
}

interface AddMembersRequest {
  members: {
    userId: string;
    roleInTeam: 'Manager' | 'Lead' | 'Member';
  }[];
}

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './team-list.component.html',
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
      flex-wrap: wrap;
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
      position: relative;
    }

    .member-avatar.manager {
      background: var(--error);
    }

    .member-avatar.lead {
      background: var(--warning);
    }

    .member-role-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
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

    .member-search {
      position: relative;
      margin-bottom: var(--space-3);
    }

    .search-input {
      width: 100%;
      padding: var(--space-2) var(--space-6) var(--space-2) var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--neutral-300);
      border-top: none;
      border-radius: 0 0 var(--radius-sm) var(--radius-sm);
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
    }

    .search-result-item {
      padding: var(--space-2);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      transition: background-color var(--transition-fast);
    }

    .search-result-item:hover {
      background: var(--neutral-100);
    }

    .search-result-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: var(--font-size-xs);
    }

    .search-result-info {
      flex: 1;
    }

    .search-result-name {
      font-weight: 500;
      font-size: var(--font-size-sm);
    }

    .search-result-email {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .selected-members {
      margin-bottom: var(--space-3);
    }

    .selected-members h4 {
      margin-bottom: var(--space-2);
      color: var(--neutral-800);
    }

    .member-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .member-tag {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background: var(--primary-light);
      color: white;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .member-tag-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: 500;
    }

    .member-tag-info {
      display: flex;
      flex-direction: column;
    }

    .member-tag-name {
      font-weight: 500;
      line-height: 1;
    }

    .member-tag-role {
      font-size: var(--font-size-xs);
      opacity: 0.9;
    }

    .role-select {
      padding: var(--space-1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: var(--font-size-xs);
      margin-left: var(--space-1);
    }

    .remove-member {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }

    .remove-member:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .current-members h3 {
      margin-bottom: var(--space-2);
      color: var(--neutral-800);
    }

    .member-list {
      max-height: 300px;
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
      margin-left: var(--space-2);
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

      .member-tags {
        flex-direction: column;
      }
    }
  `]
})
export class TeamListComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);

  teams = signal<Team[]>([]);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  showModal = signal(false);
  showMembersModal = signal(false);
  loading = false;
  submitted = false;
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;
  searchTerm = '';
  selectedMembers: { user: User; roleInTeam: 'Manager' | 'Lead' | 'Member' }[] = [];

  teamForm: FormGroup = this.formBuilder.group({
    teamName: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadTeams();
    this.loadUsers();
  }

  get f() { return this.teamForm.controls; }

  loadTeams(): void {
    this.teamService.getTeamList().subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.teams.set(response.data || []);
        }
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.toastr.error('Failed to load teams');
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.users.set(response.data || []);
          this.filteredUsers.set(response.data || []);
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastr.error('Failed to load users');
      }
    });
  }

  canCreateTeam(): boolean {
    return this.authService.isAdminOrHR();
  }

  canManageTeam(): boolean {
    return this.authService.isAdminOrHR();
  }

  openCreateModal(): void {
    this.editingTeam = null;
    this.teamForm.reset();
    this.selectedMembers = [];
    this.submitted = false;
    this.showModal.set(true);
  }

  editTeam(team: Team): void {
    this.editingTeam = team;
    this.teamForm.patchValue({
      teamName: team.teamName,
      description: team.description || ''
    });
    this.submitted = false;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTeam = null;
    this.teamForm.reset();
    this.selectedMembers = [];
    this.submitted = false;
    this.searchTerm = '';
    this.filteredUsers.set(this.users());
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.teamForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.teamForm.value;
    const teamData: CreateTeamRequest = {
      teamName: formValue.teamName,
      description: formValue.description
    };

    if (this.editingTeam) {
      // Update team logic would go here
      this.toastr.info('Team update functionality not implemented yet');
      this.loading = false;
      return;
    }

    // Create new team
    this.teamService.createTeam(teamData).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.toastr.success('Team created successfully');
          
          // If members are selected, add them to the team
          if (this.selectedMembers.length > 0) {
            this.addMembersToTeam(response.data.teamId);
          } else {
            this.loadTeams();
            this.closeModal();
            this.loading = false;
          }
        }
      },
      error: (error) => {
        console.error('Error creating team:', error);
        this.toastr.error('Failed to create team');
        this.loading = false;
      }
    });
  }

  addMembersToTeam(teamId: string): void {
    const membersData: AddMembersRequest = {
      members: this.selectedMembers.map(member => ({
        userId: member.user.userId,
        roleInTeam: member.roleInTeam
      }))
    };

    this.teamService.addTeamMembers(teamId, membersData).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.toastr.success('Team and members added successfully');
        }
        this.loadTeams();
        this.closeModal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error adding members:', error);
        this.toastr.error('Team created but failed to add members');
        this.loadTeams();
        this.closeModal();
        this.loading = false;
      }
    });
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete "${team.teamName}"?`)) {
      this.teamService.deleteTeam(team.teamId).subscribe({
        next: () => {
          this.toastr.success('Team deleted successfully');
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error deleting team:', error);
          this.toastr.error('Failed to delete team');
        }
      });
    }
  }

  openMembersModal(team: Team): void {
    this.selectedTeam = team;
    this.selectedMembers = [];
    this.searchTerm = '';
    this.filteredUsers.set(this.users());
    this.showMembersModal.set(true);
  }

  closeMembersModal(): void {
    this.showMembersModal.set(false);
    this.selectedTeam = null;
    this.selectedMembers = [];
    this.searchTerm = '';
    this.filteredUsers.set(this.users());
  }

  onSearchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers.set(this.users());
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filtered = this.users().filter(user => 
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.primaryEmail.toLowerCase().includes(term) ||
      user.designation?.toLowerCase().includes(term)
    );
    
    this.filteredUsers.set(filtered);
  }

  selectUser(user: User): void {
    // Check if user is already selected
    if (this.selectedMembers.some(member => member.user.userId === user.userId)) {
      return;
    }

    // Check if user is already a team member
    if (this.selectedTeam && this.selectedTeam.members.some(member => member.userId === user.userId)) {
      this.toastr.warning('User is already a member of this team');
      return;
    }

    this.selectedMembers.push({
      user: user,
      roleInTeam: 'Member'
    });

    this.searchTerm = '';
    this.filteredUsers.set(this.users());
  }

  removeMember(userId: string): void {
    this.selectedMembers = this.selectedMembers.filter(member => member.user.userId !== userId);
  }

  updateMemberRole(userId: string, role: 'Manager' | 'Lead' | 'Member'): void {
    const member = this.selectedMembers.find(m => m.user.userId === userId);
    if (member) {
      member.roleInTeam = role;
    }
  }

  addSelectedMembers(): void {
    if (!this.selectedTeam || this.selectedMembers.length === 0) {
      return;
    }

    this.loading = true;
    const membersData: AddMembersRequest = {
      members: this.selectedMembers.map(member => ({
        userId: member.user.userId,
        roleInTeam: member.roleInTeam
      }))
    };

    this.teamService.addTeamMembers(this.selectedTeam.teamId, membersData).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.toastr.success('Members added successfully');
          this.loadTeams();
          this.closeMembersModal();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error adding members:', error);
        this.toastr.error('Failed to add members');
        this.loading = false;
      }
    });
  }

  getTotalMembers(): number {
    return this.teams().reduce((total, team) => total + team.members.length, 0);
  }

  getAverageTeamSize(): number {
    if (this.teams().length === 0) return 0;
    return Math.round(this.getTotalMembers() / this.teams().length);
  }

  getUserName(userId: string): string {
    const user = this.users().find(u => u.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  getUserInitials(userId: string): string {
    const user = this.users().find(u => u.userId === userId);
    return user ? this.getInitials(user.firstName, user.lastName) : '?';
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Manager': return '👑';
      case 'Lead': return '⭐';
      default: return '';
    }
  }
}