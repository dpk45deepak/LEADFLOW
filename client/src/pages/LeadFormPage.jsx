import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import ErrorState from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { leadsApi } from '../api/leads';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function LeadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [serverErrors, setServerErrors] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    leadsApi.get(id).then(setLead).catch((e) => setLoadError(getErrorMessage(e))).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isEdit) load();
  }, [isEdit, load]);

  const initialValues = useMemo(
    () => (lead ? { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status } : undefined),
    [lead],
  );

  const onSubmit = async (values) => {
    setServerErrors([]);
    try {
      if (isEdit) await leadsApi.update(id, values);
      else await leadsApi.create(values);
      toast.success(isEdit ? 'Lead updated' : 'Lead created');
      navigate('/leads');
    } catch (err) {
      setServerErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit lead' : 'Add lead'}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">{isEdit ? 'Update the details or move the lead to a new status.' : 'Capture a new potential customer.'}</p>
      <div className="card p-5 sm:p-6">
        {loading ? (
          <div className="space-y-4" role="status" aria-label="Loading lead">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : (
          <LeadForm
            initialValues={initialValues}
            submitLabel={isEdit ? 'Save changes' : 'Create lead'}
            onSubmit={onSubmit}
            onCancel={() => navigate('/leads')}
            serverErrors={serverErrors}
          />
        )}
      </div>
    </div>
  );
}
