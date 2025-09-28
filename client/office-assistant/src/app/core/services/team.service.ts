import { Injectable, signal } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private http: HttpClient){}
    
  // Get all teams
  getTeamList(): Observable<any> {
    return this.http.get<any>('/api/teams').pipe(map((res) => res));
  }

  createTeam(teamData: any): Observable<any> {
    return this.http.post<any>('/api/teams', teamData).pipe(map((res) => res));
  }

  // Add members to a team
  addTeamMembers(teamId: string, membersData: any): Observable<any> {
    return this.http.post<any>(`/api/teams/${teamId}/members`, membersData).pipe(map((res) => res));
  }
  // Update a team
  updateTeam(teamId: string, teamData: any): Observable<any> {
    return this.http.patch<any>(`/api/teams/${teamId}`, teamData).pipe(map((res) => res));
  }

  // delete team members
  deleteTeamMember(teamMemberId: string): Observable<any> {
    return this.http.delete<any>(`/api/teams/members/${teamMemberId}`);
  }

  // Delete a team
  deleteTeam(teamId: string): Observable<any> {
    return this.http.delete<any>(`/api/teams/${teamId}`).pipe(map((res) => res));
  }

}