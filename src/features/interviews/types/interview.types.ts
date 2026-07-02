// ─── Enums ───────────────────────────────────────────────────

export const MEETING_PLATFORMS = [
  'Google Meet',
  'Microsoft Teams',
  'Zoom',
  'Other',
] as const;

export const INTERVIEW_STATUSES = [
  'Pending',
  'Scheduled',
  'InProgress',
  'Completed',
  'Cancelled',
] as const;

export const SORT_OPTIONS = ['newest', 'oldest', 'date'] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

// ─── Interview ───────────────────────────────────────────────

export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  meetingPlatform: MeetingPlatform;
  meetingLink: string;
  date: string;
  time: string;
  duration: number;
  status: InterviewStatus;
  notes?: string;
  createdBy: string;
  inviteToken?: string;
  inviteTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── API Response Shapes ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface InterviewListData {
  interviews: Interview[];
  pagination: PaginationMeta;
}

export interface InterviewDetailData {
  interview: Interview;
}

// ─── Query Params ────────────────────────────────────────────

export interface InterviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InterviewStatus;
  platform?: MeetingPlatform;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOption;
}

// ─── Form Inputs ─────────────────────────────────────────────

export interface CreateInterviewInput {
  title: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  meetingPlatform: MeetingPlatform;
  meetingLink: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export interface UpdateInterviewInput extends Partial<CreateInterviewInput> {
  status?: InterviewStatus;
}
