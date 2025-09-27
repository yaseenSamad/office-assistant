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
    return this.getAllUsers().pipe(
      map((users) => users.find((u: any) => u.userId === id) || null)
    );
  }

  // ✅ Create a new user
  createUser(userData: User): Observable<User> {
    return this.http
      .post<{ data: User }>(this.baseUrl, userData)
      .pipe(map((res) => res.data));
  }

  // ✅ Update user details
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http
      .put<{ data: User }>(`${this.baseUrl}/${id}`, userData)
      .pipe(map((res) => res.data));
  }

  // ✅ Delete user
  deleteUser(id: string): Observable<string> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.message));
  }


}
