export interface Holiday {
  id: string;
  title: string;
  description?: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

export interface CreateHolidayDto {
  title: string;
  description?: string;
  date: Date;
}