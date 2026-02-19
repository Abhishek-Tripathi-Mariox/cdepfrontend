import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Props = {
  module: string;
  action: string;
};

export const RequirePermission: React.FC<Props> = ({ module, action }) => {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission(module, action)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

