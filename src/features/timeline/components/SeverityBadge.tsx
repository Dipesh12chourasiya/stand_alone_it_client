import type { TimelineSeverity } from '../types/timeline.types';
import { SEVERITY_COLORS } from '../types/timeline.types';

interface SeverityBadgeProps {
  severity: TimelineSeverity;
}

/**
 * Small colored badge showing the severity level of a timeline event.
 * Uses pre-defined color maps for light and dark mode.
 */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[severity]}`}
    >
      {severity}
    </span>
  );
}
