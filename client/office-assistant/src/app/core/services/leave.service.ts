import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import moment from 'moment';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private http: HttpClient) {}

  applyLeave(userId: string,data: any): Observable<any> {
    return this.http.post(`/api/leaves/requests/${userId}`, data).pipe(map(res => res));
  }

  getMyLeaves(userId: string): Observable<any> {
    const currentYear = moment().year();
    return this.http.get(`/api/leaves/requests/${userId}?year=${currentYear}`).pipe(map(res => res));
  }

  updateLeaveStatus(userId: string,leaveId: string, data: any): Observable<any> {
    return this.http.patch(`/api/leaves/requests/${leaveId}/${userId}`, data).pipe(map(res => res));
  }

  getPendingApprovals(userId: string): Observable<any> {
    return this.http.get(`/api/leaves/requests/pending/${userId}`).pipe(map(res => res));
  }

  createLeaveType(userId: string,data: any): Observable<any> {
    return this.http.post(`/api/leaves/types/${userId}`, data).pipe(map(res => res));
  }

  getLeaveTypes(userId: string): Observable<any> {
    const currentYear = moment().year();
    return this.http.get(`/api/leaves/types/${userId}?year=${currentYear}`).pipe(map(res => res));
  }

  deleteLeaveType(leaveTypeId: string): Observable<any> {
    return this.http.delete(`/api/leaves/types/${leaveTypeId}`).pipe(map(res => res));
  }

  //////////////////

  


  // 🔴 Delete leave request (if allowed)
  deleteLeave(leaveId: string): Observable<any> {
    return this.http.delete(`/api/leaves/${leaveId}`).pipe(map(res => res));
  }

    // 🟧 Update Leave Type
  updateLeaveType(id: string, data: any): Observable<any> {
    return this.http.patch(`/api/leave-types/${id}`, data).pipe(map(res => res));
  }

}
