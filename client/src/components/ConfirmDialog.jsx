import { useEffect, useRef } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ open, title, children, confirmLabel = 'Delete', loading, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !loading && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !loading && onCancel()} aria-hidden="true" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" className="card relative w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-50 p-2.5 text-red-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">{title}</h2>
            <div id="confirm-desc" className="mt-1 text-sm text-slate-600">{children}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
