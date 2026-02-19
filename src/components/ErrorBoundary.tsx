import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // In a real deployment we would send this to a logging endpoint.
    console.error('ErrorBoundary caught error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="glass-card px-8 py-6 max-w-md w-full text-center">
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              An unexpected error occurred. Please refresh the page. If the problem
              persists, contact your administrator.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-primary-700"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

