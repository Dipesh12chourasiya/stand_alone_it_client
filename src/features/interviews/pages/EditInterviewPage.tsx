import { Link, useParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterviews';
import { InterviewForm } from '../components/InterviewForm';
import { FormSkeleton } from '../components/LoadingSkeleton';

export function EditInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: interview, isLoading, isError, error } = useInterview(id);

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (isError || !interview) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">Interview not found</p>
          <p className="mt-1 text-sm text-red-500">
            {(error as { message?: string })?.message ?? 'This interview does not exist.'}
          </p>
          <Link
            to="/interviews"
            className="mt-4 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Back to interviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to interviews
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Edit interview
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update the details for &ldquo;{interview.title}&rdquo;
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <InterviewForm mode="edit" interview={interview} />
      </div>
    </div>
  );
}
