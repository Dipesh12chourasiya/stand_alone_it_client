import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeviceCheckCard } from '../components/DeviceCheckCard';
import {
  useSubmitDeviceVerification,
  useDeviceVerificationStatus,
} from '../hooks/useCandidate';
import type { DeviceVerificationResult } from '../types/candidate.types';

interface CheckState {
  camera: boolean | null;
  microphone: boolean | null;
  browser: boolean | null;
  internet: boolean | null;
  screenResolution: boolean | null;
  os: boolean | null;
}

export function DeviceVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<CheckState>({
    camera: null,
    microphone: null,
    browser: null,
    internet: null,
    screenResolution: null,
    os: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<DeviceVerificationResult | null>(null);

  const submitMutation = useSubmitDeviceVerification(token!);
  const { data: existingStatus } = useDeviceVerificationStatus(token!);

  // If already verified, go directly to waiting room
  useEffect(() => {
    if (existingStatus) {
      navigate(`/candidate/waiting/${token}`, { replace: true });
    }
  }, [existingStatus, navigate, token]);

  const runChecks = useCallback(async () => {
    const results: CheckState = {
      camera: null,
      microphone: null,
      browser: true,
      internet: null,
      screenResolution: true,
      os: true,
    };

    // Browser check
    const ua = navigator.userAgent.toLowerCase();
    const isSupported =
      ua.includes('chrome') ||
      ua.includes('firefox') ||
      ua.includes('safari') ||
      ua.includes('edge') ||
      ua.includes('opera');
    results.browser = isSupported;
    setChecks({ ...results });

    // Screen resolution
    if (window.screen.width > 0 && window.screen.height > 0) {
      results.screenResolution = true;
    }
    setChecks({ ...results });

    // OS detection
    results.os = true;
    setChecks({ ...results });

    // Internet check
    try {
      const online = navigator.onLine;
      results.internet = online;
      setChecks({ ...results });
    } catch {
      results.internet = false;
      setChecks({ ...results });
    }

    // Camera permission check
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((d) => d.kind === 'videoinput');
      results.camera = hasCamera;
      setChecks({ ...results });
    } catch {
      results.camera = false;
      setChecks({ ...results });
    }

    // Microphone permission check
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some((d) => d.kind === 'audioinput');
      results.microphone = hasMic;
      setChecks({ ...results });
    } catch {
      results.microphone = false;
      setChecks({ ...results });
    }
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const allComplete = Object.values(checks).every((v) => v !== null);

  async function handleSubmit() {
    if (!token) return;

    const data = {
      cameraPermission: checks.camera === true,
      microphonePermission: checks.microphone === true,
      browser: navigator.userAgent || 'unknown',
      operatingSystem: getOS(),
      internetStatus: checks.internet === true,
      cameraAvailable: checks.camera === true,
      microphoneAvailable: checks.microphone === true,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    submitMutation.mutate(data, {
      onSuccess: (res) => {
        setResult(res as DeviceVerificationResult);
        setSubmitted(true);
      },
    });
  }

  if (submitted && result) {
    const ready = result.overall === 'READY';

    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              ready ? 'bg-green-100' : 'bg-amber-100'
            }`}
          >
            {ready ? (
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-xl font-semibold text-neutral-900">
            {ready ? 'All Checks Passed' : 'Some Checks Failed'}
          </h1>
          <p className="text-sm text-neutral-500">
            {ready
              ? 'Your device is ready for the interview.'
              : 'Please resolve the issues below and try again.'}
          </p>

          {result.checks.map((check) => (
            <DeviceCheckCard
              key={check.name}
              label={check.name}
              passed={check.status === 'PASS'}
              icon={<CheckIcon />}
              description=""
            />
          ))}

          {ready && (
            <button
              type="button"
              onClick={() => navigate(`/candidate/waiting/${token}`)}
              className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 cursor-pointer"
            >
              Enter Waiting Room
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            Device Verification
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Checking your device setup...
          </p>
        </div>

        <div className="space-y-3">
          <DeviceCheckCard
            label="Camera"
            passed={checks.camera}
            icon={<CameraIcon />}
            description="Checking if a camera is available"
          />
          <DeviceCheckCard
            label="Microphone"
            passed={checks.microphone}
            icon={<MicIcon />}
            description="Checking if a microphone is available"
          />
          <DeviceCheckCard
            label="Browser"
            passed={checks.browser}
            icon={<BrowserIcon />}
            description={`${navigator.userAgent.split('/')[0] || 'Browser'} detected`}
          />
          <DeviceCheckCard
            label="Internet Connection"
            passed={checks.internet}
            icon={<InternetIcon />}
            description={navigator.onLine ? 'Connected' : 'Disconnected'}
          />
          <DeviceCheckCard
            label="Screen Resolution"
            passed={checks.screenResolution}
            icon={<ScreenIcon />}
            description={`${window.screen.width} × ${window.screen.height}`}
          />
          <DeviceCheckCard
            label="Operating System"
            passed={checks.os}
            icon={<OSIcon />}
            description={getOS()}
          />
        </div>

        {allComplete && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {submitMutation.isPending && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {submitMutation.isPending
              ? 'Submitting...'
              : 'Submit & Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
  return 'Unknown';
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function InternetIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}

function OSIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  );
}
