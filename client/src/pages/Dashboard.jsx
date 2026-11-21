import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PhoneCall, Plus, Sparkles, UserCheck, UserX, Users } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { leadsApi } from '../api/leads';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';
import { LEAD_STATUSES, STATUS_STYLES } from '../lib/constants';

const CARDS = [
  { key: 'total', label: 'Total leads', icon: Users, tone: 'bg-indigo-50 text-indigo-600' },
  { key: 'New', label: 'New', icon: Sparkles, tone: 'bg-blue-50 text-blue-600' },
  { key: 'Contacted', label: 'Contacted', icon: PhoneCall, tone: 'bg-orange-50 text-orange-600' },
  { key: 'Qualified', label: 'Qualified', icon: UserCheck, tone: 'bg-green-50 text-green-600' },
  { key: 'Lost', label: 'Lost', icon: UserX, tone: 'bg-red-50 text-red-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([leadsApi.stats(), leadsApi.list({ limit: 5, sortBy: 'createdAt', order: 'desc' })])
      .then(([s, list]) => {
        setStats(s);
        setRecent(list.data);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const chartData = stats ? LEAD_STATUSES.map((s) => ({ status: s, count: stats[s] })) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">Here is where your pipeline stands today.</p>
        </div>
        <Link to="/leads/new" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Add lead</Link>
      </div>

      {error ? (
        <div className="card"><ErrorState message={error} onRetry={load} /></div>
      ) : (
        <>
          <section aria-label="Lead statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {CARDS.map(({ key, label, icon: Icon, tone }) => (
              <div key={key} className={`card p-4 ${key === 'total' ? 'col-span-2 lg:col-span-1' : ''}`}>
                <div className={`mb-3 inline-flex rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></div>
                <p className="text-sm text-slate-500">{label}</p>
                {loading ? <Skeleton className="mt-1 h-8 w-12" /> : <p className="text-3xl font-bold text-slate-900">{stats[key]}</p>}
              </div>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-5">
            <section className="card p-5 lg:col-span-2" aria-label="Lead distribution by status">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Leads by status</h2>
              {loading ? (
                <Skeleton className="h-60 w-full" />
              ) : stats.total === 0 ? (
                <EmptyState title="No data yet" message="The chart appears once you add leads." />
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {chartData.map((d) => <Cell key={d.status} fill={STATUS_STYLES[d.status].hex} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="card lg:col-span-3" aria-label="Recent leads">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Recent leads</h2>
                <Link to="/leads" className="text-sm font-semibold text-teal-700 hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="space-y-3 p-5 pt-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
              ) : recent.length === 0 ? (
                <EmptyState title="No leads yet" message="Add your first lead to see it here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-sm">
                    <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th scope="col" className="px-5 py-2 text-left font-semibold">Name</th>
                        <th scope="col" className="px-3 py-2 text-left font-semibold">Company</th>
                        <th scope="col" className="px-3 py-2 text-left font-semibold">Status</th>
                        <th scope="col" className="px-5 py-2 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recent.map((l) => (
                        <tr key={l._id}>
                          <td className="px-5 py-3 font-medium text-slate-900">{l.name}</td>
                          <td className="px-3 py-3 text-slate-600">{l.company}</td>
                          <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                          <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(l.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
