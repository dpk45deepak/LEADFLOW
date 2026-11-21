import { Inbox } from 'lucide-react';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
        <Inbox className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
