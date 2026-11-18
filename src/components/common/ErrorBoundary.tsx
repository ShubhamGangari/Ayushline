import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cleanAuthErrorMessage } from '../../hooks/useAuth';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

const IS_PROD = import.meta.env.PROD;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Ayushline] Error caught by ErrorBoundary (Ref: ${this.state.errorId}):`, error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorId: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorId: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-ayush-cream px-4 py-12" role="alert" aria-live="assertive">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-ayush-forest/10">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <h2 className="text-2xl font-display font-bold text-ayush-forest mb-2">
              Something went wrong
            </h2>
            <p className="text-sm font-body text-ayush-charcoal/70 mb-2 leading-relaxed">
              We encountered an unexpected technical issue. Don't worry — your health data and session remain secure.
            </p>

            {this.state.errorId && (
              <p className="text-xs font-mono text-ayush-charcoal/40 mb-3 bg-ayush-sage/30 rounded-lg px-3 py-2">
                Error reference: <span className="font-bold">{this.state.errorId}</span>
              </p>
            )}

            {this.state.error && (
              <details className="mb-6 text-left border border-ayush-forest/10 rounded-xl p-2.5 bg-ayush-ivory/50">
                <summary className="text-xs font-ui text-ayush-charcoal/60 cursor-pointer font-semibold select-none flex items-center justify-between hover:text-ayush-forest">
                  <span>Technical details</span>
                  <span className="text-[10px] text-ayush-charcoal/40">(click to view)</span>
                </summary>
                <div className="mt-2 text-xs text-red-600 bg-red-50/80 rounded-lg p-2.5 overflow-auto max-h-32 font-mono break-words border border-red-100">
                  {cleanAuthErrorMessage(this.state.error.message || 'An unexpected runtime error occurred.')}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ayush-forest text-white font-ui font-semibold text-sm hover:bg-ayush-forest/90 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ayush-sage/40 text-ayush-forest font-ui font-semibold text-sm hover:bg-ayush-sage/70 transition-all border border-ayush-forest/10"
              >
                <Home className="w-4 h-4" aria-hidden="true" /> Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
