export interface Salary {
  salaryId: string;
  userId: string;
  amount: number;
  payType: 'monthly' | 'hourly';
  effectiveDate: string;
}
