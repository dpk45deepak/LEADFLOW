import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '../lib/constants';

export default function Pagination({ page, totalPages, total, limit, onPage, onLimit }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold">{from}-{to}</span> of <span className="font-semibold">{total}</span>
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Rows
          <select value={limit} onChange={(e) => onLimit(Number(e.target.value))} className="input w-auto py-1.5">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn disabled:opacity-40" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-sm text-slate-700">Page {page} of {totalPages}</span>
          <button type="button" className="icon-btn disabled:opacity-40" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
