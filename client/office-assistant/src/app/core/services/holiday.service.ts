import { Injectable, signal } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { Holiday, CreateHolidayDto } from '../models/holiday.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  



  constructor(private http: HttpClient) {}

  getHolidays(year?: number): Observable<any> {
    const url = year ? `/api/holidays?year=${year}` : '';
    return this.http.get<any>(url).pipe(map(res => res));
  }

  createHoliday(data: Partial<any>): Observable<any> {
    return this.http.post<any>(`/api/holidays`, data).pipe(map(res => res));
  }

  patchHoliday(holId: string, data: Partial<Holiday>): Observable<any> {
    return this.http.patch<any>(`/api/holidays/${holId}`, data).pipe(map(res => res));
  }

  deleteHoliday(holId: string): Observable<any> {
    return this.http.delete<any>(`/api/holidays/${holId}`).pipe(map(res => res));
  }
}