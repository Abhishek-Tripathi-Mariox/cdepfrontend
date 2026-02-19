import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/auth/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { RequireAuth } from './router/RequireAuth';
import { OverviewPage } from './pages/OverviewPage';
import { PmDashboardPage } from './pages/pm/PmDashboardPage';
import { DevTimesheetsPage } from './pages/dev/DevTimesheetsPage';
import { ClientProjectsPage } from './pages/client/ClientProjectsPage';
import { RbacPage } from './pages/admin/RbacPage';
import { RequirePermission } from './router/RequirePermission';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />

            <Route
              path="pm"
              element={<RequirePermission module="projects" action="view" />}
            >
              <Route path="dashboard" element={<PmDashboardPage />} />
            </Route>

            <Route
              path="dev"
              element={<RequirePermission module="timesheets" action="create" />}
            >
              <Route path="timesheets" element={<DevTimesheetsPage />} />
            </Route>

            <Route
              path="client"
              element={<RequirePermission module="projects" action="view" />}
            >
              <Route path="projects" element={<ClientProjectsPage />} />
            </Route>

            <Route
              path="admin"
              element={<RequirePermission module="roles" action="view" />}
            >
              <Route path="rbac" element={<RbacPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;

