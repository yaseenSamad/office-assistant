import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  // ✅ Fetch all users
  getAllUsers(): Observable<any> {
    return this.http.get<any>('/api/users').pipe(
      map((res) => res)
    );
  }

  // ✅ Get single user by ID
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.statusCode === 200 ? res.data : null)
    );
  }

  // ✅ Create a new user
  createUser(userData: User): Observable<User> {
    return this.http
      .post<{ data: User }>(this.baseUrl, userData)
      .pipe(map((res) => res.data));
  }

  // ✅ Update user details
  updateUser(id: string, userData: Partial<any>): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, userData)
      .pipe(map((res) => res));
  }

  // ✅ Delete user
  deleteUser(id: string): Observable<string> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.message));
  }

  getUpcomingBirthdays(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/upcoming-birthdays`).pipe(
      map((res) => res)
    );
  }
}
