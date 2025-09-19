import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Team, CreateTeamDto, UpdateTeamDto } from '../models/team.model';

// Mock data for demonstration
const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Engineering Team',
    description: 'Software development and technical operations',
    leader: '5', // Mike Chen
    members: ['3', '5'], // John Doe, Mike Chen
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Marketing Team',
    description: 'Brand promotion and customer engagement',
    leader: '4', // Sarah Johnson
    members: ['4'], // Sarah Johnson
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01')
  },
  {
    id: '3',
    name: 'HR Team',
    description: 'Human resources and employee relations',
    leader: '2', // HR Manager
    members: ['2', '6'], // HR Manager, Emma Wilson
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05')
  }
];

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams = signal<Team[]>(MOCK_TEAMS);
  
  getTeams(): Observable<Team[]> {
    return of(this.teams().sort((a, b) => a.name.localeCompare(b.name)));
  }
  
  getTeam(id: string): Observable<Team | null> {
    const team = this.teams().find(t => t.id === id);
    return of(team || null);
  }
  
  createTeam(teamData: CreateTeamDto): Observable<Team> {
    const newTeam: Team = {
      id: (this.teams().length + 1).toString(),
      name: teamData.name,
      description: teamData.description,
      leader: teamData.leader,
      members: teamData.members || [teamData.leader],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.teams.update(teams => [...teams, newTeam]);
    return of(newTeam);
  }
  
  updateTeam(id: string, teamData: UpdateTeamDto): Observable<Team> {
    const teamIndex = this.teams().findIndex(t => t.id === id);
    if (teamIndex === -1) {
      return throwError(() => new Error('Team not found'));
    }
    
    const updatedTeam: Team = {
      ...this.teams()[teamIndex],
      ...teamData,
      updatedAt: new Date()
    };
    
    this.teams.update(teams => 
      teams.map(t => t.id === id ? updatedTeam : t)
    );
    
    return of(updatedTeam);
  }
  
  deleteTeam(id: string): Observable<void> {
    this.teams.update(teams => teams.filter(t => t.id !== id));
    return of(void 0);
  }
  
  addMemberToTeam(teamId: string, userId: string): Observable<Team> {
    const team = this.teams().find(t => t.id === teamId);
    if (!team) {
      return throwError(() => new Error('Team not found'));
    }
    
    if (!team.members.includes(userId)) {
      const updatedTeam = {
        ...team,
        members: [...team.members, userId],
        updatedAt: new Date()
      };
      
      this.teams.update(teams => 
        teams.map(t => t.id === teamId ? updatedTeam : t)
      );
      
      return of(updatedTeam);
    }
    
    return of(team);
  }
  
  removeMemberFromTeam(teamId: string, userId: string): Observable<Team> {
    const team = this.teams().find(t => t.id === teamId);
    if (!team) {
      return throwError(() => new Error('Team not found'));
    }
    
    const updatedTeam = {
      ...team,
      members: team.members.filter(m => m !== userId),
      updatedAt: new Date()
    };
    
    this.teams.update(teams => 
      teams.map(t => t.id === teamId ? updatedTeam : t)
    );
    
    return of(updatedTeam);
  }
  
  getTeamsByMember(userId: string): Observable<Team[]> {
    const userTeams = this.teams().filter(t => 
      t.members.includes(userId) || t.leader === userId
    );
    return of(userTeams);
  }
}