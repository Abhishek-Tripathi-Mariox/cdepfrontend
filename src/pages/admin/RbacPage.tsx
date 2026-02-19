import React from 'react';
import { useAuthStore } from '../../store/authStore';

// This page surfaces current-role permissions from the JWT-loaded user.
// It does not POST to any RBAC admin endpoint to avoid assuming API shapes.

export const RbacPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">RBAC & Roles</h1>
        <p className="text-sm text-slate-500">
          Effective permissions derived from your assigned roles. Role definitions are
          managed centrally in the backend.
        </p>
      </div>

      <div className="glass-card px-4 py-3 space-y-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Effective roles
          </div>
          <div className="flex flex-wrap gap-1">
            {user.roles.map((r) => (
              <span
                key={r._id}
                className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Permissions by module
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-1 pr-2">Module</th>
                  <th className="py-1 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  user.roles.reduce<Record<string, Set<string>>>((acc, role) => {
                    Object.entries(role.permissions ?? {}).forEach(
                      ([module, actions]) => {
                        if (!acc[module]) acc[module] = new Set();
                        actions.forEach((a) => acc[module].add(a));
                      }
                    );
                    return acc;
                  }, {})
                ).map(([module, actions]) => (
                  <tr key={module} className="border-b border-slate-50">
                    <td className="py-1 pr-2 text-slate-700">{module}</td>
                    <td className="py-1 pr-2 text-slate-700">
                      {Array.from(actions)
                        .sort()
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          To adjust roles or permissions, update the Roles collection in the backend
          RBAC engine. This UI reflects the current JWT-loaded state and is
          tenant-aware.
        </p>
      </div>
    </div>
  );
};

