import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkExperienceService {
  private baseUrl = '/api/work-experience';

  constructor(private http: HttpClient) { }

  createWorkExperience(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}`, data);
  }

  updateWorkExperience(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteWorkExperience(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
