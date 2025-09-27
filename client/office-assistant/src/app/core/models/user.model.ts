export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  userId: string;               // UUID
  username: string;
  password: string;             // Hashed password in DB
  firstName: string;
  lastName: string;
  primaryPhone: string;         // 10–15 digits
  secondaryPhone?: string;      // optional
  primaryEmail: string;
  secondaryEmail?: string;      // optional
  temporaryAddress?: string;    // optional
  permanentAddress: string;
  officeId: string;
  bloodGroup: string;
  dob: string;                  // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationality: string;
  linkedin?: string;            // optional
  department: string;
  subDepartment: {itemCode: string, itemName: string};
  role: UserRole;
  designation: string;
  reporterId?: string;          // UUID of manager/reporter
}


export interface UserCredentials {
  username: string;
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