import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, UserCredentials, AuthResponse, UserRole, RegisterUserDto } from '../models/user.model';

// Mock data for demonstration (would be replaced with real API calls)
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
    dateJoined: new Date('2023-01-01')
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
    dateJoined: new Date('2023-01-10')
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
    dateJoined: new Date('2023-02-15')
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated = signal(false);
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  initAuth(): void {
    const token = this.getToken();
    const userData = this.getUserData();
    
    if (token && userData) {
      this.currentUserSubject.next(userData);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    // Mock implementation (replace with actual API call)
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password') { // Simple mock validation
      const response: AuthResponse = {
        user,
        token: 'mock_jwt_token_' + Date.now()
      };
      
      this.setToken(response.token);
      this.setUserData(response.user);
      this.currentUserSubject.next(response.user);
      this.isAuthenticated.set(true);
      
      return of(response);
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }

  register(userData: RegisterUserDto): Observable<AuthResponse> {
    // Mock implementation (replace with actual API call)
    const newUser: User = {
      id: (MOCK_USERS.length + 1).toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      dateJoined: new Date(),
      isActive: true
    };
    
    const response: AuthResponse = {
      user: newUser,
      token: 'mock_jwt_token_' + Date.now()
    };
    
    MOCK_USERS.push(newUser);
    
    return of(response).pipe(
      tap(res => {
        this.setToken(res.token);
        this.setUserData(res.user);
        this.currentUserSubject.next(res.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user !== null && roles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole([UserRole.ADMIN]);
  }

  isHR(): boolean {
    return this.hasRole([UserRole.HR]);
  }

  isEmployee(): boolean {
    return this.hasRole([UserRole.EMPLOYEE]);
  }

  isAdminOrHR(): boolean {
    return this.hasRole([UserRole.ADMIN, UserRole.HR]);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Method to get all users for team management
  getAllUsers(): User[] {
    return MOCK_USERS.filter(u => u.isActive);
  }
}