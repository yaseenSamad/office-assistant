import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { User, UserCredentials, AuthResponse, UserRole, RegisterUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  initAuth(): void {
    const token = this.getToken();
    const userData = this.getUserData();

    if (token && userData) {
      this.currentUserSubject.next(userData);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: UserCredentials): Observable<any> {
    return this.http.post<any>('/auth/login', credentials).pipe(
      tap((response) => {
        if(response?.statusCode === 200 && response?.data?.user && response?.data?.token){
          this.setToken(response?.data?.token);
          this.setUserData( response?.data?.user);
          this.currentUserSubject.next( response?.data?.user);
          this.isAuthenticated.set(true);
        }else {
          throw new Error(response?.message || 'Login failed');
        }
      }),
      catchError((error) => {
        return throwError(() => error.error || 'Login failed');
      })
    );
  }

  register(userData: RegisterUserDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/register', userData).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.setUserData(res.user);
        this.currentUserSubject.next(res.user);
        this.isAuthenticated.set(true);
      }),
      catchError((error) => throwError(() => error))
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


}
