import { useState, useEffect, useRef } from 'react';

// ─── Props ───────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// ─── Component ───────────────────────────────────────────────

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search interviews…',
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const isFirstRender = useRef(true);

  // Sync external value changes (e.g., on clear)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce: emit changes after 400ms of inactivity
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onChange(local);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-150 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
        aria-label="Search interviews"
      />

      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
