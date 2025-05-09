export interface Team {
  id: string;
  name: string;
  description?: string;
  leader: string;
  members: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  leader: string;
  members?: string[];
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  leader?: string;
  members?: string[];
}