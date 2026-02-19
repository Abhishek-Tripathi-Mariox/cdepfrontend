import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BellIcon } from '@heroicons/react/24/outline';

const navClass =
  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50/80 transition-colors';

export const AppLayout: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="flex h-screen max-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white/80 backdrop-blur-xs shadow-glass flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold shadow">
                C
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">CDEP</div>
                <div className="text-xs text-slate-500">
                  Client Development & Engagement
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                Workspaces
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/"
                  className={({ isActive: active }) =>
                    `${navClass} ${active ? 'bg-primary-50 text-primary-700' : ''}`
                  }
                  end
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Overview
                </NavLink>
                <NavLink
                  to="/pm/dashboard"
                  className={({ isActive: active }) =>
                    `${navClass} ${active || isActive('/pm') ? 'bg-primary-50 text-primary-700' : ''}`
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-accent-500" />
                  PM Dashboard
                </NavLink>
                <NavLink
                  to="/dev/timesheets"
                  className={({ isActive: active }) =>
                    `${navClass} ${active || isActive('/dev') ? 'bg-primary-50 text-primary-700' : ''}`
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Developer Portal
                </NavLink>
                <NavLink
                  to="/client/projects"
                  className={({ isActive: active }) =>
                    `${navClass} ${active || isActive('/client') ? 'bg-primary-50 text-primary-700' : ''}`
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Client Portal
                </NavLink>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                Governance
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/admin/rbac"
                  className={({ isActive: active }) =>
                    `${navClass} ${active || isActive('/admin') ? 'bg-primary-50 text-primary-700' : ''}`
                  }
                >
                  RBAC & Roles
                </NavLink>
              </div>
            </div>
          </nav>

          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Signed in as</div>
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user?.name ?? 'Unknown user'}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-xs flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Tenant:</span>
              <span className="text-sm text-slate-900">
                {user?.tenantId ?? 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative rounded-full p-2 bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <BellIcon className="h-5 w-5" />
                {/* badge – wired once notifications API is available */}
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent-500" />
              </button>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Role(s)</span>
                <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                  {user?.roles.map((r) => r.name).join(', ') || '—'}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

