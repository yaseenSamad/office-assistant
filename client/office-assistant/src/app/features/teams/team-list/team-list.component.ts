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
  styleUrls: ['./team-list.component.scss']
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

  deleteMember(teamMemberId: string){

      if (!this.selectedTeam) return;

  if (confirm('Are you sure you want to remove this member?')) {
    this.loading = true;

    this.teamService.deleteTeamMember(teamMemberId).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.toastr.success('Member removed successfully');

          this.selectedTeam!.members = this.selectedTeam?.members?.filter((item)=> item.teamMemberId != teamMemberId) || []
          this.loadTeams()
          this.loadUsers()
        } else {
          this.toastr.error('Failed to remove member');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error removing member:', error);
        this.toastr.error('Failed to remove member');
        this.loading = false;
      },
    });
  }



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
          this.teamService.updateTeam(this.editingTeam.teamId,teamData).subscribe({
            next: (response) => {
              if (response.statusCode === 200) {
                this.toastr.success('Team updated successfully');
                  this.loadTeams();
                  this.closeModal();
                  this.loading = false;
              }else{
                  this.toastr.error('Failed to update team');
                  this.loading = false;
              }
            },
            error: (error) => {
              console.error('Error updating team:', error);
              this.toastr.error('Failed to update team');
              this.loading = false;
            }
          })
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
        }else{
            this.toastr.error('Failed to create team');
            this.loading = false;
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
        }else{
          this.toastr.error('Team created but failed to add members');
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
        next: (response) => {
          if(response.statusCode === 200){
            this.toastr.success('Team deleted successfully');
            this.loadTeams();
          }else{
            this.toastr.error('Failed to delete team');
          }
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