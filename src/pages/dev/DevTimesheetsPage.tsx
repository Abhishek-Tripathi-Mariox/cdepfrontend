import React, { useEffect, useMemo, useState } from 'react';
import { fetchMyTimesheets, createTimesheet, Timesheet } from '../../api/timesheets';
import { fetchAllocations } from '../../api/allocations';
import { useAuthStore } from '../../store/authStore';
import { Skeleton } from '../../components/Skeleton';

export const DevTimesheetsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState<number>(4);
  const [description, setDescription] = useState('');
  const [blockers, setBlockers] = useState('');
  const [allocations, setAllocations] = useState<
    { id: string; label: string; projectName: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ts, allocs] = await Promise.all([
          fetchMyTimesheets(),
          fetchAllocations()
        ]);
        if (cancelled) return;
        setTimesheets(ts);

        const devId = user?.id;
        const myAllocs = allocs
          .filter((a) => {
            const dev = a.developer as any;
            return (
              (typeof dev === 'string' && dev === devId) ||
              (dev && typeof dev === 'object' && dev._id === devId)
            );
          })
          .map((a) => ({
            id: a._id,
            label: `${(a.project as any)?.name ?? 'Project'} – ${a.role} (${a.dailyCapacityPct}% cap)`,
            projectName: (a.project as any)?.name ?? 'Project'
          }));
        setAllocations(myAllocs);
        if (myAllocs.length > 0) {
          setSelectedAllocation(myAllocs[0].id);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load timesheets');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const dailyTotal = useMemo(
    () =>
      timesheets
        .filter((t) => t.date.slice(0, 10) === date)
        .reduce((sum, t) => sum + t.hours, 0),
    [timesheets, date]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createTimesheet({
        allocation: selectedAllocation,
        project: '', // backend will infer from allocation if implemented that way
        date,
        hours,
        description,
        blockers: blockers || undefined
      });
      setDescription('');
      setBlockers('');
      const updated = await fetchMyTimesheets();
      setTimesheets(updated);
      setSuccess('Timesheet submitted for approval.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Developer Portal</h1>
          <p className="text-sm text-slate-500">
            See your allocations, log time, and watch burn vs. remaining capacity.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Daily timesheet
          </h2>
          {loading && <Skeleton className="h-32 w-full" />}
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Allocation
                </label>
                <select
                  value={selectedAllocation}
                  onChange={(e) => setSelectedAllocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {allocations.length === 0 && (
                    <option value="">No active allocations</option>
                  )}
                  {allocations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Hours (max 8)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    step={0.5}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Work description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Blockers (optional)
                </label>
                <textarea
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Logged today: {dailyTotal.toFixed(1)}h</span>
                <span>Only approved hours count toward burn.</span>
              </div>
              <button
                type="submit"
                disabled={submitting || allocations.length === 0}
                className="w-full inline-flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-medium py-2.5 shadow hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit for approval'}
              </button>
            </form>
          )}
        </div>

        <div className="glass-card px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Recent timesheets
          </h2>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : timesheets.length === 0 ? (
            <p className="text-xs text-slate-500">
              No timesheets yet. Submit your first entry to start tracking burn vs
              allocation.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2">Hours</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .slice(0, 20)
                    .map((t) => (
                      <tr key={t._id} className="border-b border-slate-50">
                        <td className="py-2 pr-2">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-2">{t.hours}</td>
                        <td className="py-2 pr-2">
                          <span
                            className={
                              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                              (t.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : t.status === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700')
                            }
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2 pr-2 max-w-xs truncate">
                          <span title={t.description}>{t.description}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

