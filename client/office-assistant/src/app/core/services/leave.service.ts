import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private http: HttpClient) {}

  // 🟩 Apply new leave
  applyLeave(userId: string,data: any): Observable<any> {
    return this.http.post(`/api/leaves/requests/${userId}`, data).pipe(map(res => res));
  }

  // 🟨 Get my leaves
  getMyLeaves(userId: string): Observable<any> {
    return this.http.get(`/api/leaves/requests/${userId}`).pipe(map(res => res));
  }

    // 🟧 Approve or Reject leave
  updateLeaveStatus(userId: string,leaveId: string, data: any): Observable<any> {
    return this.http.patch(`/api/leaves/requests/${leaveId}/${userId}`, data).pipe(map(res => res));
  }

  createLeaveType(userId: string,data: any): Observable<any> {
    return this.http.post(`/api/leaves/types/${userId}`, data).pipe(map(res => res));
  }

  // 🟨 Get All Leave Types
  getLeaveTypes(): Observable<any> {
    return this.http.get('/api/leaves/types').pipe(map(res => res));
  }

  // 🔴 Delete Leave Type
  deleteLeaveType(leaveTypeId: string): Observable<any> {
    return this.http.delete(`/api/leaves/types/${leaveTypeId}`).pipe(map(res => res));
  }

  //////////////////

  
  // 🟦 Get leaves awaiting my approval (HR/Admin/Reporter)
  getPendingApprovals(): Observable<any> {
    return this.http.get('/api/leaves/pending').pipe(map(res => res));
  }

  // 🔴 Delete leave request (if allowed)
  deleteLeave(leaveId: string): Observable<any> {
    return this.http.delete(`/api/leaves/${leaveId}`).pipe(map(res => res));
  }

    // 🟧 Update Leave Type
  updateLeaveType(id: string, data: any): Observable<any> {
    return this.http.patch(`/api/leave-types/${id}`, data).pipe(map(res => res));
  }

}
