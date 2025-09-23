export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  department?: string;
  position?: string;
  dateJoined?: Date;
  phoneNumber?: string;
  isActive: boolean;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  position?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}