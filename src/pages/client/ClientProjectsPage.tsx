import React, { useEffect, useState } from 'react';
import { fetchProjects, Project } from '../../api/projects';
import { Skeleton } from '../../components/Skeleton';

export const ClientProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchProjects();
        if (!cancelled) setProjects(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load projects');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Client Projects</h1>
          <p className="text-sm text-slate-500">
            View active engagements, milestones, and overall progress.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : projects.length === 0 ? (
        <p className="text-xs text-slate-500">
          No projects available. Once your account is associated with client projects,
          they will show up here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="glass-card px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {p.code}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {p.name}
                  </div>
                </div>
                <span
                  className={
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                    (p.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : p.status === 'active'
                      ? 'bg-sky-50 text-sky-700'
                      : p.status === 'on_hold'
                      ? 'bg-amber-50 text-amber-700'
                      : p.status === 'cancelled'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-slate-50 text-slate-600')
                  }
                >
                  {p.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Client:{' '}
                  {typeof p.client === 'string'
                    ? p.client
                    : p.client?.name ?? 'Unknown'}
                </span>
                <span>
                  PM:{' '}
                  {typeof p.pm === 'string' ? p.pm : (p.pm as any)?.name ?? 'N/A'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {p.startDate && (
                  <span>
                    Start: {new Date(p.startDate).toLocaleDateString()} •{' '}
                  </span>
                )}
                {p.endDate && (
                  <span>End: {new Date(p.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

