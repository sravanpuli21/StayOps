import { AlertCircle } from 'lucide-react';

interface Props {
  /** The error returned from useScopedData / usePropertyScoped. */
  error: unknown;
  /** Optional retry callback (passed `swr.mutate()` from the hook). */
  onRetry?: () => void;
}

/**
 * Visible failure indicator for dashboard pages. Shown when a hook returns
 * a non-null `error`. Without this, fetch failures silently degrade the UI
 * to "everything reads zero" — operators wouldn't know to reload.
 */
export function ErrorBanner({ error, onRetry }: Props) {
  if (!error) return null;
  const message =
    error instanceof Error ? error.message :
    typeof error === 'string' ? error :
    'Something went wrong loading this data.';

  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b91c1c' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#7f1d1d' }}>
          Couldn&apos;t load this dashboard
        </p>
        <p className="text-xs mt-1" style={{ color: '#991b1b' }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold px-3 h-8 rounded-lg flex-shrink-0"
          style={{ background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
