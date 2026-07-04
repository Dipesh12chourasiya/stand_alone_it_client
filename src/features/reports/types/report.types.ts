// ─── Report ─────────────────────────────────────────────────────

export interface InterviewInfo {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  meetingPlatform: string;
  meetingLink: string;
  date: string;
  time: string;
  duration: number;
  status: string;
}

export interface RecruiterInfo {
  id: string;
  name: string;
  email: string;
  company: string;
}

export interface ConnectionRecord {
  role: string;
  connectedAt: string;
  disconnectedAt?: string;
  duration?: number;
}

export interface DeviceCheckItem {
  name: string;
  status: 'pass' | 'fail';
}

export interface DeviceVerificationSummary {
  overall: 'pass' | 'fail';
  checks: DeviceCheckItem[];
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  submittedAt?: string;
}

export interface TimelineSummaryEntry {
  eventType: string;
  severity: string;
  message: string;
  createdAt: string;
}

export interface Report {
  id: string;
  interviewId: string;
  recruiterId: string;
  interview: InterviewInfo;
  recruiter?: RecruiterInfo;
  duration: number;
  status: string;
  timelineSummary?: TimelineSummaryEntry[];
  connectionHistory?: ConnectionRecord[];
  deviceVerification?: DeviceVerificationSummary;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Shapes ────────────────────────────────────────

export interface ReportListData {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportDetailData {
  report: Report;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Query Params ───────────────────────────────────────────────

export interface ReportListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
}

// ─── Form Inputs ────────────────────────────────────────────────

export interface CreateReportInput {
  interviewId: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}
