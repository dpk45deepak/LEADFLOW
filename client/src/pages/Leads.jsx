import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, X } from 'lucide-react';
import LeadTable from '../components/LeadTable';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { TableSkeleton } from '../components/Skeleton';
import { leadsApi } from '../api/leads';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { LEAD_STATUSES, PAGE_SIZES } from '../lib/constants';

export default function Leads() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // All list state lives in the URL, so filters survive refresh and can be shared.
  const search = params.get('search') ?? '';
  const status = LEAD_STATUSES.includes(params.get('status')) ? params.get('status') : '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = PAGE_SIZES.includes(Number(params.get('limit'))) ? Number(params.get('limit')) : PAGE_SIZES[0];
  const sortBy = params.get('sortBy') === 'name' ? 'name' : 'createdAt';
  const order = params.get('order') === 'asc' ? 'asc' : 'desc';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput);
  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const update = useCallback(
    (changes, { replace = false, keepPage = false } = {}) => {
      const next = new URLSearchParams(paramsRef.current);
      Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))));
      if (!keepPage) next.delete('page');
      setParams(next, { replace });
    },
    [setParams],
  );

  // URL -> input (navbar search, clear filters)
  useEffect(() => setSearchInput(search), [search]);
  // input -> URL (debounced typing)
  useEffect(() => {
    if (debouncedSearch.trim() !== (paramsRef.current.get('search') ?? '')) {
      update({ search: debouncedSearch.trim() }, { replace: true });
    }
  }, [debouncedSearch, update]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    leadsApi
      .list({ search: search || undefined, status: status || undefined, page, limit, sortBy, order }, controller.signal)
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });
    return () => controller.abort();
  }, [search, status, page, limit, sortBy, order, reloadKey]);

  const onSort = (field) => {
    if (sortBy === field) update({ order: order === 'asc' ? 'desc' : 'asc' }, { keepPage: true });
    else update({ sortBy: field, order: field === 'name' ? 'asc' : 'desc' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setParams(new URLSearchParams(), { replace: false });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.remove(toDelete._id);
      toast.success(`Deleted ${toDelete.name}`);
      setToDelete(null);
      if (result.data.length === 1 && page > 1) update({ page: page - 1 }, { keepPage: true });
      else setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const { total, totalPages } = result.pagination;
  const filtered = Boolean(search || status);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All leads</h1>
          <p className="mt-1 text-sm text-slate-500">Search, filter and update your pipeline.</p>
        </div>
        <Link to="/leads/new" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Add lead</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="lead-search" className="sr-only">Search by name</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="lead-search" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name" className="input pl-9" />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select id="status-filter" value={status} onChange={(e) => update({ status: e.target.value })} className="input w-full sm:w-44">
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {filtered && (
              <button type="button" onClick={clearFilters} className="btn-secondary whitespace-nowrap">
                <X className="h-4 w-4" aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : result.data.length === 0 ? (
          filtered ? (
            <EmptyState title="No leads match your filters" message="Try a different name or status." action={<button type="button" onClick={clearFilters} className="btn-secondary">Clear filters</button>} />
          ) : (
            <EmptyState title="No leads yet" message="Add your first lead to start tracking your pipeline." action={<Link to="/leads/new" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Add lead</Link>} />
          )
        ) : (
          <>
            <LeadTable leads={result.data} onDelete={setToDelete} sortBy={sortBy} order={order} onSort={onSort} />
            <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={(p) => update({ page: p }, { keepPage: true })} onLimit={(l) => update({ limit: l })} />
          </>
        )}
      </div>

      <ConfirmDialog open={Boolean(toDelete)} title="Delete lead?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)}>
        Are you sure you want to delete <strong className="text-slate-900">{toDelete?.name}</strong>? This cannot be undone.
      </ConfirmDialog>
    </div>
  );
}
