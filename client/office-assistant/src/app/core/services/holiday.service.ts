import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Holiday, CreateHolidayDto } from '../models/holiday.model';

// Mock data for demonstration
const MOCK_HOLIDAYS: Holiday[] = [
  {
    id: '1',
    title: 'New Year\'s Day',
    description: 'Start of the new year',
    date: new Date('2025-01-01'),
    isFloater: false,
    createdBy: 'admin',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    title: 'Independence Day',
    description: 'National holiday celebrating independence',
    date: new Date('2025-07-04'),
    isFloater: false,
    createdBy: 'admin',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '3',
    title: 'Christmas Day',
    description: 'Christmas celebration',
    date: new Date('2025-12-25'),
    isFloater: false,
    createdBy: 'admin',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '4',
    title: 'Personal Day',
    description: 'Flexible personal holiday',
    date: new Date('2025-06-15'),
    isFloater: true,
    createdBy: 'admin',
    createdAt: new Date('2024-12-01')
  }
];

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private holidays = signal<Holiday[]>(MOCK_HOLIDAYS);
  
  getHolidays(): Observable<Holiday[]> {
    return of(this.holidays().sort((a, b) => a.date.getTime() - b.date.getTime()));
  }
  
  getHoliday(id: string): Observable<Holiday | null> {
    const holiday = this.holidays().find(h => h.id === id);
    return of(holiday || null);
  }
  
  createHoliday(holidayData: CreateHolidayDto): Observable<Holiday> {
    const newHoliday: Holiday = {
      id: (this.holidays().length + 1).toString(),
      title: holidayData.title,
      description: holidayData.description,
      date: holidayData.date,
      createdBy: 'current-user', // Would be replaced with actual user ID
      createdAt: new Date()
    };
    
    this.holidays.update(holidays => [...holidays, newHoliday]);
    return of(newHoliday);
  }
  
  updateHoliday(id: string, holidayData: Partial<CreateHolidayDto>): Observable<Holiday> {
    const holidayIndex = this.holidays().findIndex(h => h.id === id);
    if (holidayIndex === -1) {
      return throwError(() => new Error('Holiday not found'));
    }
    
    const updatedHoliday: Holiday = {
      ...this.holidays()[holidayIndex],
      ...holidayData,
      updatedAt: new Date()
    };
    
    this.holidays.update(holidays => 
      holidays.map(h => h.id === id ? updatedHoliday : h)
    );
    
    return of(updatedHoliday);
  }
  
  deleteHoliday(id: string): Observable<void> {
    this.holidays.update(holidays => holidays.filter(h => h.id !== id));
    return of(void 0);
  }
  
  getUpcomingHolidays(limit: number = 5): Observable<Holiday[]> {
    const today = new Date();
    const upcoming = this.holidays()
      .filter(h => h.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
    
    return of(upcoming);
  }
}