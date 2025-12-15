export enum LoanType {
  PERSONAL = 'Personal',
  HOME = 'Home',
  VEHICLE = 'Vehicle',
  EDUCATION = 'Education'
}
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored for mock auth only
}
export interface Loan {
  id: string;
  name: string; // e.g., "HDFC Home Loan"
  type: LoanType;
  principal: number;
  rate: number;
  tenureMonths: number;
  startDate: string;
  emi: number;
  status?: 'active' | 'closed';
  closedDate?: string;
}

export interface Note {
  id: string;
  loanId: string; // Link to a specific loan
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}
export interface Reminder {
  id: string;
  loanId: string;
  title: string;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string; // Timestamp of when the payment was marked as done
  type: 'payment' | 'task'; // 'payment' for EMI, 'task' for generic to-dos
}
export interface EMIBreakdown {
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}
