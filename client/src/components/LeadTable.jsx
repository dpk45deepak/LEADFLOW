import { Link } from 'react-router-dom';
import { ArrowUpDown, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../lib/format';

function SortHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th scope="col" aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left font-semibold">
      <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-slate-900">
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-teal-600' : 'text-slate-400'}`} aria-hidden="true" />
      </button>
    </th>
  );
}

function RowActions({ lead, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/leads/${lead._id}/edit`} className="icon-btn" aria-label={`Edit ${lead.name}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button type="button" onClick={() => onDelete(lead)} className="icon-btn hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${lead.name}`} title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function LeadTable({ leads, onDelete, sortBy, order, onSort }) {
  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <SortHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={onSort} />
              <th scope="col" className="px-4 py-3 text-left font-semibold">Email</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Phone</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Company</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Source</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
              <SortHeader label="Created" field="createdAt" sortBy={sortBy} order={order} onSort={onSort} />
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l._id} className="hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{l.name}</td>
                <td className="px-4 py-3 text-slate-600">{l.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{l.phone}</td>
                <td className="px-4 py-3 text-slate-600">{l.company}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{l.source}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3"><RowActions lead={l} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {leads.map((l) => (
          <li key={l._id} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{l.name}</p>
                <p className="truncate text-sm text-slate-500">{l.company}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
            <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-slate-500">Email</dt><dd className="truncate text-slate-700">{l.email}</dd>
              <dt className="text-slate-500">Phone</dt><dd className="text-slate-700">{l.phone}</dd>
              <dt className="text-slate-500">Source</dt><dd className="text-slate-700">{l.source}</dd>
              <dt className="text-slate-500">Created</dt><dd className="text-slate-700">{formatDate(l.createdAt)}</dd>
            </dl>
            <RowActions lead={l} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
}
