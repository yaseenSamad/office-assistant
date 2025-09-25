import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User, UserRole, RegisterUserDto } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

// Extended mock data for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    department: 'Management',
    position: 'System Administrator',
    dateJoined: new Date('2023-01-01'),
    phoneNumber: '+1-555-0101'
  },
  {
    id: '2',
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@example.com',
    role: UserRole.HR,
    isActive: true,
    department: 'Human Resources',
    position: 'HR Manager',
    dateJoined: new Date('2023-01-10'),
    phoneNumber: '+1-555-0102'
  },
  {
    id: '3',
    firstName: 'John',
    lastName: 'Doe',
    email: 'employee@example.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    department: 'Engineering',
    position: 'Software Developer',
    dateJoined: new Date('2023-02-15'),
    phoneNumber: '+1-555-0103'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    department: 'Marketing',
    position: 'Marketing Specialist',
    dateJoined: new Date('2023-03-20'),
    phoneNumber: '+1-555-0104'
  },
  {
    id: '5',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@example.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    department: 'Engineering',
    position: 'Senior Developer',
    dateJoined: new Date('2023-01-25'),
    phoneNumber: '+1-555-0105'
  },
  {
    id: '6',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@example.com',
    role: UserRole.HR,
    isActive: true,
    department: 'Human Resources',
    position: 'HR Specialist',
    dateJoined: new Date('2023-04-10'),
    phoneNumber: '+1-555-0106'
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@example.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    department: 'Sales',
    position: 'Sales Representative',
    dateJoined: new Date('2023-05-15'),
    phoneNumber: '+1-555-0107'
  },
  {
    id: '8',
    firstName: 'Lisa',
    lastName: 'Rodriguez',
    email: 'lisa.rodriguez@example.com',
    role: UserRole.EMPLOYEE,
    isActive: true,
    department: 'Design',
    position: 'UI/UX Designer',
    dateJoined: new Date('2023-06-01'),
    phoneNumber: '+1-555-0108'
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient){}

  private users = signal<User[]>(MOCK_USERS);
  
  getUsers(): Observable<User[]> {
    return of(this.users().filter(u => u.isActive));
  }
  
  getUser(id: string): Observable<User | null> {
    const user = this.users().find(u => u.id === id);
    return of(user || null);
  }
  
  // createUser(userData: RegisterUserDto): Observable<User> {
  //   const newUser: User = {
  //     id: (this.users().length + 1).toString(),
  //     firstName: userData.firstName,
  //     lastName: userData.lastName,
  //     email: userData.email,
  //     role: userData.role,
  //     department: userData.department,
  //     position: userData.position,
  //     dateJoined: new Date(),
  //     isActive: true,
  //     phoneNumber: '+1-555-0' + (100 + this.users().length)
  //   };
    
  //   this.users.update(users => [...users, newUser]);
  //   return of(newUser);
  // }
  
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    const userIndex = this.users().findIndex(u => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }
    
    const updatedUser: User = {
      ...this.users()[userIndex],
      ...userData
    };
    
    this.users.update(users => 
      users.map(u => u.id === id ? updatedUser : u)
    );
    
    return of(updatedUser);
  }
  
  // deleteUser(id: string): Observable<void> {
  //   this.users.update(users => 
  //     users.map(u => u.id === id ? { ...u, isActive: false } : u)
  //   );
  //   return of(void 0);
  // }
  
  getUsersByDepartment(department: string): Observable<User[]> {
    const departmentUsers = this.users().filter(u => 
      u.department === department && u.isActive
    );
    return of(departmentUsers);
  }
  
  getUsersByRole(role: UserRole): Observable<User[]> {
    const roleUsers = this.users().filter(u => 
      u.role === role && u.isActive
    );
    return of(roleUsers);
  }

   getAllUsers(): Observable<any> {
    return this.http.get('/api/users');
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`/api/users/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post('/api/users', userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`/api/users/${id}`);
  }
  
}