import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Anymd ErrorBoundary caught an uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center font-mono">
          <div className="bg-slate-900 border-2 border-indigo-500/60 p-8 rounded-3xl max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <Shield className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              🐾 KawaiiNeko Safety Shield
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              An unhandled render exception occurred, but your markdown files and local state remain safe and untouched!
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-3 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 text-left overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
