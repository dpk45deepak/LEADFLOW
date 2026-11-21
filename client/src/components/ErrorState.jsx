import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-red-50 p-3 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">Could not load data</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}
