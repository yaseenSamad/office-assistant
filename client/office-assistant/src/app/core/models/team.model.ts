import { User } from "./user.model";

export interface Team {
  teamId: string;
  teamName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  teamMemberId: string;
  teamId: string;
  userId: string;
  roleInTeam: 'Manager' | 'Lead' | 'Member';
  joinedAt: string;
  user?: User;
}

export interface CreateTeamRequest {
  teamName: string;
  description?: string;
}

export interface AddMembersRequest {
  members: {
    userId: string;
    roleInTeam: 'Manager' | 'Lead' | 'Member';
  }[];
}