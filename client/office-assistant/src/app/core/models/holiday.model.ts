export interface Holiday {
  id: string;
  title: string;
  description?: string;
  date: Date;
  isFloater?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateHolidayDto {
  title: string;
  description?: string;
  date: Date;
  isFloater?: boolean;
}