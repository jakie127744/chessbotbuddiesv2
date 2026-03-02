'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary', 'Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border-2 border-red-600 rounded-xl p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-zinc-300 mb-4">
              The application encountered an error. Please refresh the page to continue.
            </p>
            {this.state.error && (
              <details className="text-sm text-zinc-500">
                <summary className="cursor-pointer mb-2">Error details</summary>
                <pre className="bg-neutral-900 p-3 rounded overflow-auto text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
