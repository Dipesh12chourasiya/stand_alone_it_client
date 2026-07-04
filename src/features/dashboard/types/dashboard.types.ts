export interface DashboardStats {
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
  todaysInterviews: number;
}

export interface StatusCounts {
  Pending: number;
  Scheduled: number;
  InProgress: number;
  Completed: number;
  Cancelled: number;
}

export interface WeeklyData {
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
}

export interface MonthlyData {
  January: number;
  February: number;
  March: number;
  April: number;
  May: number;
  June: number;
  July: number;
  August: number;
  September: number;
  October: number;
  November: number;
  December: number;
}

export interface RecentInterview {
  _id: string;
  title: string;
  candidateName: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}
