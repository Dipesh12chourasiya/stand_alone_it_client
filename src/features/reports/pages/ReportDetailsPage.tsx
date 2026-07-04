import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReport, useDeleteReport } from '../hooks/useReports';
import { reportApi } from '../api/report.api';
import type { TimelineSeverity } from '@/features/timeline/types/timeline.types';

/**
 * Full report details page with interview info, timeline, device verification,
 * connection history, and download button.
 */
export function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, isError, error } = useReport(id);
  const deleteReport = useDeleteReport();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Report not found
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {(error as { message?: string })?.message || 'This report could not be loaded.'}
        </p>
        <Link
          to="/reports"
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Back to reports
        </Link>
      </div>
    );
  }

  if (!report) return null;

  const dv = report.deviceVerification;
  const timeline = report.timelineSummary || [];
  const connections = report.connectionHistory || [];
  const downloadUrl = reportApi.getDownloadUrl(report.id);

  // ─── Severity colors for timeline ───────────────────────────
  const severityStyles: Record<TimelineSeverity, string> = {
    INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    SUCCESS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete this report? This action cannot be undone.`)) return;
    deleteReport.mutate(report.id, {
      onSuccess: () => navigate('/reports'),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/reports" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Reports
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">{report.interview.candidateName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {report.interview.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generated {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </a>
          <button
            onClick={handleDelete}
            disabled={deleteReport.isPending}
            className="inline-flex items-center rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Duration" value={`${report.duration} min`} />
        <SummaryCard
          label="Status"
          value={report.status}
          color={report.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}
        />
        <SummaryCard label="Timeline Events" value={String(timeline.length)} />
        <SummaryCard
          label="Device Check"
          value={dv ? (dv.overall === 'pass' ? '✅ Passed' : '❌ Failed') : '—'}
        />
      </div>

      {/* Interview Information */}
      <Section title="Interview Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Title" value={report.interview.title} />
          <InfoItem label="Platform" value={report.interview.meetingPlatform} />
          <InfoItem
            label="Date"
            value={`${new Date(report.interview.date).toLocaleDateString()} at ${report.interview.time}`}
          />
          <InfoItem label="Meeting Link" value={report.interview.meetingLink} />
          <InfoItem label="Status" value={report.status} />
        </div>
      </Section>

      {/* People */}
      <Section title="People">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Candidate
            </h4>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {report.interview.candidateName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {report.interview.candidateEmail}
            </p>
            {report.interview.candidatePhone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.interview.candidatePhone}
              </p>
            )}
          </div>
          {report.recruiter && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Recruiter
              </h4>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {report.recruiter.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.recruiter.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.recruiter.company}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Device Verification */}
      {dv && (
        <Section title="Device Verification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Check Results
              </h4>
              <div className="space-y-2">
                {dv.checks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{check.name}</span>
                    <span
                      className={`font-medium ${
                        check.status === 'pass' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Device Info
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {dv.browser && <p>Browser: {dv.browser}</p>}
                {dv.operatingSystem && <p>OS: {dv.operatingSystem}</p>}
                {dv.screenResolution && <p>Resolution: {dv.screenResolution}</p>}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Connection History */}
      {connections.length > 0 && (
        <Section title="Connection History">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Connected</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Disconnected</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {connections.map((conn, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 capitalize text-gray-900 dark:text-gray-100">{conn.role}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {new Date(conn.connectedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {conn.disconnectedAt ? new Date(conn.disconnectedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {conn.duration !== undefined ? `${conn.duration} min` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Timeline Summary */}
      {timeline.length > 0 && (
        <Section title={`Timeline (${timeline.length} events)`}>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeline.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    severityStyles[entry.severity as TimelineSeverity] || severityStyles.INFO
                  }`}
                >
                  {entry.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {entry.eventType.replace(':', ' — ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.message}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </time>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Notes */}
      {report.notes && (
        <Section title="Notes">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {report.notes}
          </p>
        </Section>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-gray-100 ${color || ''}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-all">{value}</p>
    </div>
  );
}
