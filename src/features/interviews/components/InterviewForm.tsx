import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateInterview, useUpdateInterview } from '../hooks/useInterviews';
import { MEETING_PLATFORMS, INTERVIEW_STATUSES } from '../types/interview.types';
import type { Interview, MeetingPlatform, InterviewStatus } from '../types/interview.types';

// ─── Schema ──────────────────────────────────────────────────

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  candidateName: z.string().min(1, 'Candidate name is required').max(100, 'Name must not exceed 100 characters'),
  candidateEmail: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  candidatePhone: z.string().optional(),
  meetingPlatform: z.enum([...MEETING_PLATFORMS] as [string, ...string[]], {
    message: 'Select a meeting platform',
  }),
  meetingLink: z.string().min(1, 'Meeting link is required').url('Enter a valid URL (include https://)'),
  date: z.string().min(1, 'Date is required').refine((v) => !isNaN(Date.parse(v)), 'Enter a valid date'),
  time: z.string().min(1, 'Time is required'),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(480, 'Max 480 minutes'),
  status: z.enum([...INTERVIEW_STATUSES] as [string, ...string[]]).optional(),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ───────────────────────────────────────────────────

interface InterviewFormProps {
  mode: 'create' | 'edit';
  interview?: Interview;
}

// ─── Options ─────────────────────────────────────────────────

const platformOptions = MEETING_PLATFORMS.map((p) => ({ value: p, label: p }));
const statusOptions = INTERVIEW_STATUSES.map((s) => ({ value: s, label: s }));

// ─── Component ───────────────────────────────────────────────

export function InterviewForm({ mode, interview }: InterviewFormProps) {
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview(interview?.id);

  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      title: interview?.title ?? '',
      candidateName: interview?.candidateName ?? '',
      candidateEmail: interview?.candidateEmail ?? '',
      candidatePhone: interview?.candidatePhone ?? '',
      meetingPlatform: (interview?.meetingPlatform ?? '') as MeetingPlatform,
      meetingLink: interview?.meetingLink ?? '',
      date: interview?.date ? extractDate(interview.date) : '',
      time: interview?.time ?? '',
      duration: interview?.duration ?? 60,
      status: (interview?.status ?? 'Scheduled') as InterviewStatus,
      notes: interview?.notes ?? '',
    },
  });

  const onSubmit = (data: FormValues) => {
    if (mode === 'create') {
      createMutation.mutate(
        {
          title: data.title,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          candidatePhone: data.candidatePhone || undefined,
          meetingPlatform: data.meetingPlatform as MeetingPlatform,
          meetingLink: data.meetingLink,
          date: data.date,
          time: data.time,
          duration: data.duration,
          notes: data.notes || undefined,
        },
        {
          onError: (error: unknown) => {
            const apiErr = error as { errors?: string[]; message?: string };
            applyServerErrors(apiErr.errors, setError);
          },
        },
      );
    } else {
      updateMutation.mutate(
        {
          title: data.title,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          candidatePhone: data.candidatePhone || undefined,
          meetingPlatform: data.meetingPlatform as MeetingPlatform,
          meetingLink: data.meetingLink,
          date: data.date,
          time: data.time,
          duration: data.duration,
          status: data.status as InterviewStatus,
          notes: data.notes || undefined,
        },
        {
          onError: (error: unknown) => {
            const apiErr = error as { errors?: string[]; message?: string };
            applyServerErrors(apiErr.errors, setError);
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Title"
        placeholder="e.g. Senior Frontend Interview"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Candidate name"
          placeholder="Jane Doe"
          error={errors.candidateName?.message}
          {...register('candidateName')}
        />
        <Input
          label="Candidate email"
          type="email"
          placeholder="jane@company.com"
          error={errors.candidateEmail?.message}
          {...register('candidateEmail')}
        />
      </div>

      <Input
        label="Candidate phone (optional)"
        type="tel"
        placeholder="+1 555 0123"
        error={errors.candidatePhone?.message}
        {...register('candidatePhone')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Meeting platform"
          options={platformOptions}
          placeholder="Select platform"
          error={errors.meetingPlatform?.message}
          {...register('meetingPlatform')}
        />
        <Input
          label="Meeting link"
          type="url"
          placeholder="https://meet.google.com/abc-defg-hij"
          error={errors.meetingLink?.message}
          hint="Include https://"
          {...register('meetingLink')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Time"
          type="time"
          error={errors.time?.message}
          {...register('time')}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          placeholder="60"
          error={errors.duration?.message}
          {...register('duration')}
        />
      </div>

      {mode === 'edit' && (
        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      )}

      {/* Notes textarea */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Add any notes about this interview…"
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-150 resize-none ${
            errors.notes
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-neutral-300 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100'
          }`}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-sm text-red-500" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" size="lg" isLoading={isPending}>
          {mode === 'create' ? 'Create interview' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Extract YYYY-MM-DD from an ISO date string for the date input.
 */
function extractDate(isoDate: string): string {
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch {
    return isoDate;
  }
}

/**
 * Parse backend validation errors like "fieldName: Error message"
 * and map them to form field errors via setError.
 */
function applyServerErrors(
  backendErrors: string[] | undefined,
  setError: ReturnType<typeof useForm<FormValues>>['setError'],
): void {
  if (!backendErrors) return;

  const fieldMap: Record<string, keyof FormValues> = {
    title: 'title',
    candidateName: 'candidateName',
    candidateEmail: 'candidateEmail',
    candidatePhone: 'candidatePhone',
    meetingPlatform: 'meetingPlatform',
    meetingLink: 'meetingLink',
    date: 'date',
    time: 'time',
    duration: 'duration',
    status: 'status',
    notes: 'notes',
  };

  for (const err of backendErrors) {
    const colonIdx = err.indexOf(':');
    if (colonIdx === -1) continue;

    const fieldKey = err.slice(0, colonIdx).trim();
    const message = err.slice(colonIdx + 1).trim();

    const formField = fieldMap[fieldKey];
    if (formField) {
      setError(formField, { message });
    }
  }
}
