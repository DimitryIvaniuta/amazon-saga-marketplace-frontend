import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { queryRetryDelay, shouldRetryQuery } from '../api/retry';
import { AuthProvider } from '../auth/AuthProvider';
import { ConnectivityBanner } from '../components/system/ConnectivityBanner';
import { ToastProvider } from '../components/system/ToastProvider';
import { reportClientError } from '../observability/telemetry';

export function Providers({ children }: { children: ReactNode }) {
  // A single client per browser mount prevents cache recreation during React renders.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
        retryDelay: queryRetryDelay,
      },
      // Mutations may represent payments or stock changes; retries require explicit idempotency.
      mutations: { retry: false },
    },
    queryCache: new QueryCache({
      onError: (error) => reportClientError(error, 'QUERY_FAILURE'),
    }),
    mutationCache: new MutationCache({
      onError: (error) => reportClientError(error, 'MUTATION_FAILURE'),
    }),
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ConnectivityBanner />
          {children}
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
