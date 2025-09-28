import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private http: HttpClient) {}

  getPolicies(): Observable<any> {
    return this.http.get('/api/policies').pipe(map(res => res));
  }

  createPolicy(data: any): Observable<any> {
    return this.http.post('/api/policies', data).pipe(map(res => res));
  }

  updatePolicy(policyId: string, data: any): Observable<any> {
    return this.http.patch(`/api/policies/${policyId}`, data).pipe(map(res => res));
  }

  deletePolicy(policyId: string): Observable<any> {
    return this.http.delete(`/api/policies/${policyId}`).pipe(map(res => res));
  }
}
