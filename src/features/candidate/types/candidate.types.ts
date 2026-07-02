export interface ValidatedInterview {
  id: string;
  title: string;
  candidateName: string;
  date: string;
  time: string;
  duration: number;
  status: string;
}

export interface ValidateResponse {
  valid: boolean;
  interview: ValidatedInterview;
}

export interface JoinInterviewData {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  meetingPlatform: string;
  meetingLink: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes?: string;
}

export interface WaitingRoomData {
  interviewId: string;
  status: WaitingRoomStatus;
  candidateJoinedAt: string;
}

export type WaitingRoomStatus =
  | 'Waiting'
  | 'RecruiterJoined'
  | 'InterviewStarted'
  | 'InterviewEnded'
  | 'Expired';

export interface DeviceVerificationInput {
  cameraPermission: boolean;
  microphonePermission: boolean;
  browser: string;
  operatingSystem: string;
  internetStatus: boolean;
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  screenResolution: string;
  timezone: string;
}

export interface DeviceCheck {
  name: string;
  status: 'PASS' | 'FAIL';
}

export interface DeviceVerificationResult {
  checks: DeviceCheck[];
  overall: 'READY' | 'BLOCKED';
}
