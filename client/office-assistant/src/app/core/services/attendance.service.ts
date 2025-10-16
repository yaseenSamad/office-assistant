import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {

  constructor(private http: HttpClient) {}
 
  getAttendance(data: Partial<any>): Observable<any> {
    return this.http.post<any>(`/api/attendance/list`, data).pipe(map(res => res));
  }

  getTodayAttendance(userId: string): Observable<any> {
    const currentDate = moment().format("YYYY-MM-DD");
  return this.http.get(`/api/attendance/today/${userId}?date=${currentDate}`).pipe(map(res => res));
}

  createAttendance(data: Partial<any>): Observable<any> {
    return this.http.patch<any>(`/api/attendance/action`, data).pipe(map(res => res));
  }

}
