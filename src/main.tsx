import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './app/App';
import { Providers } from './app/Providers';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { RouteEffects } from './components/system/RouteEffects';
import { startWebVitalsReporting } from './observability/telemetry';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <Providers>
          <RouteEffects />
          <App />
        </Providers>
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);

// Load the tiny RUM module after the purchase UI has mounted.
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => startWebVitalsReporting());
} else {
  window.setTimeout(() => startWebVitalsReporting(), 1_000);
}
