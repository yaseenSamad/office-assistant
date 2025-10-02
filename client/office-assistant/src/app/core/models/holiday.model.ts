export interface Holiday {
  holId: string;
  holDate: Date | string;
  holName: string;
  isFloater: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayDto {
  holName: string;
  description?: string;
  holDate: Date | string;
  isFloater?: boolean;
}