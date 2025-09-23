export interface Policy {
  id: string;
  title: string;
  content: string;
  category: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreatePolicyDto {
  title: string;
  content: string;
  category: string;
}