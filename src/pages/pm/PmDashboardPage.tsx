import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../../api/projects';
import { fetchAllocations } from '../../api/allocations';
import { fetchProjectRisks, ProjectRisk } from '../../api/timesheets';
import { Skeleton } from '../../components/Skeleton';

export const PmDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projectsCount, setProjectsCount] = useState(0);
  const [allocationsCount, setAllocationsCount] = useState(0);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [projects, allocations, risksData] = await Promise.all([
          fetchProjects(),
          fetchAllocations(),
          fetchProjectRisks()
        ]);
        if (cancelled) return;
        setProjectsCount(projects.length);
        setAllocationsCount(allocations.length);
        setRisks(risksData);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load PM dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const riskByStatus = risks.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            PM Dashboard – Delivery Health
          </h1>
          <p className="text-sm text-slate-500">
            Utilization, burn, and risk signals across your portfolio.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card px-4 py-3">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Active Projects
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-semibold text-slate-900">
              {projectsCount}
            </div>
          )}
        </div>
        <div className="glass-card px-4 py-3">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Active Allocations
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-semibold text-slate-900">
              {allocationsCount}
            </div>
          )}
        </div>
        <div className="glass-card px-4 py-3">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Projects at Risk
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-semibold text-slate-900">
              {(riskByStatus.warning || 0) +
                (riskByStatus.critical || 0) +
                (riskByStatus.overrun || 0) +
                (riskByStatus.deadline_risk || 0)}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Risk matrix by project
          </h2>
        </div>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : risks.length === 0 ? (
          <p className="text-xs text-slate-500">
            No risk data available yet. Approved timesheets will drive risk signals.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-4">Project ID</th>
                  <th className="py-2 pr-4">Burn rate (h/day)</th>
                  <th className="py-2 pr-4">Remaining hours</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r.projectId} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-mono text-[11px] text-slate-700">
                      {r.projectId}
                    </td>
                    <td className="py-2 pr-4">{r.burnRate.toFixed(2)}</td>
                    <td className="py-2 pr-4">{r.remaining.toFixed(1)}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                          (r.status === 'ok'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.status === 'warning'
                            ? 'bg-amber-50 text-amber-700'
                            : r.status === 'critical'
                            ? 'bg-red-50 text-red-700'
                            : r.status === 'overrun'
                            ? 'bg-red-100 text-red-800'
                            : r.status === 'no_logs'
                            ? 'bg-slate-50 text-slate-600'
                            : 'bg-orange-50 text-orange-700')
                        }
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

