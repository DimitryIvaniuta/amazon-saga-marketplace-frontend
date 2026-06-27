import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportClientError } from '../../observability/telemetry';
import { Button } from '../ui/Button';

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportClientError(new Error(`${error.message}\n${info.componentStack ?? ''}`), 'REACT_RENDER_ERROR');
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="fatal-error" id="main-content">
        <div className="fatal-error__panel" role="alert">
          <p className="eyebrow">Workspace recovery</p>
          <h1>The application could not render this screen.</h1>
          <p>No purchase action was retried automatically. Reload the portal and use the same checkout action only after reviewing the current order state.</p>
          <div className="fatal-error__actions">
            <Button onClick={() => window.location.reload()}>Reload application</Button>
            <Button variant="secondary" onClick={() => { window.location.assign('/'); }}>Return to overview</Button>
          </div>
          <small>Reference: CLIENT_RENDER_FAILURE</small>
        </div>
      </main>
    );
  }
}
