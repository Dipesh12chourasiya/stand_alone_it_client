import { Link } from 'react-router-dom';
import { InterviewForm } from '../components/InterviewForm';

export function CreateInterviewPage() {
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
          New interview
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Schedule a new proctored interview session.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <InterviewForm mode="create" />
      </div>
    </div>
  );
}
