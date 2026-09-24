'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Robin Guard ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080a08] text-neutral-200 font-mono flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg border border-red-500/50 bg-[#0c0f0e] p-6 shadow-2xl shadow-red-950/40">
            <div className="flex items-center gap-3 border-b border-red-900/60 pb-3 mb-4">
              <div className="w-8 h-8 border border-red-500 bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="font-pixel text-sm text-red-400">RUNTIME EXCEPTION CAUGHT</h1>
                <span className="text-[10px] text-neutral-500">ROBIN GUARD SUBSYSTEM RECOVERY</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-3">
              A browser execution exception occurred. The system protected the session from a white-screen crash.
            </p>

            <div className="bg-[#060a06] border border-red-950 p-3 mb-4 font-mono text-[11px] text-red-300 break-all overflow-x-auto">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 font-pixel text-xs border border-[#00ff88] bg-[#00ff88] text-black hover:bg-[#00ff88]/90 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REBOOT TERMINAL ENGINE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
