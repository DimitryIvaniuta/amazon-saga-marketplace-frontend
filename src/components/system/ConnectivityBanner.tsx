import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function ConnectivityBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return <div className="connectivity-banner" role="status"><WifiOff aria-hidden /><span>You are offline. Read data may be stale and purchases cannot be submitted.</span></div>;
}
