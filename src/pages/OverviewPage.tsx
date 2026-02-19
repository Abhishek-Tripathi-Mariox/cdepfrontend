import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../api/projects';
import { fetchAllocations } from '../api/allocations';
import { fetchProjectRisks, ProjectRisk } from '../api/timesheets';
import { Skeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';

export const OverviewPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
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
          setError(err?.response?.data?.message || 'Failed to load overview');
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

  const overloadedCount = risks.filter((r) =>
    ['critical', 'overrun', 'deadline_risk'].includes(r.status)
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          CDEP – Portfolio Overview
        </h1>
        <p className="text-sm text-slate-500">
          High-level view of engagements, capacity, and risk across the tenant.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card px-4 py-3">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Projects in portfolio
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
            Active developer allocations
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
            Projects with elevated risk
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-semibold text-slate-900">
              {overloadedCount}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Risk distribution
          </h2>
        </div>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span>
              OK:{' '}
              {risks.filter((r) => r.status === 'ok' || r.status === 'no_logs').length}
            </span>
            <span>
              Warning: {risks.filter((r) => r.status === 'warning').length}
            </span>
            <span>
              Critical: {risks.filter((r) => r.status === 'critical').length}
            </span>
            <span>
              Overrun: {risks.filter((r) => r.status === 'overrun').length}
            </span>
            <span>
              Deadline risk:{' '}
              {risks.filter((r) => r.status === 'deadline_risk').length}
            </span>
          </div>
        )}
      </div>

      <div className="glass-card px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">
          Session context
        </h2>
        <p className="text-xs text-slate-500">
          Signed in as{' '}
          <span className="font-medium text-slate-800">
            {user?.name ?? 'Unknown user'}
          </span>{' '}
          with roles{' '}
          <span className="font-medium text-slate-800">
            {user?.roles.map((r) => r.name).join(', ') || '—'}
          </span>
          . All data shown is tenant-aware and governed by the backend RBAC engine.
        </p>
      </div>
    </div>
  );
};

