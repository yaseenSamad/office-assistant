import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private baseUrl = '/api/education';

  constructor(private http: HttpClient) { }

  createEducation(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}`, data);
  }

  updateEducation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteEducation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
