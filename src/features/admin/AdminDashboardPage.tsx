import { useQuery } from '@tanstack/react-query';
import { Activity, Boxes, CreditCard, Flame, PackagePlus, ReceiptText } from 'lucide-react';
import { Link } from 'react-router';
import { adminApi, queryKeys } from '../../api/endpoints';
import { LoadingState } from '../../components/ui/Feedback';
import { Card, PageHeader, StatCard } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const operations = [
  { to: '/admin/catalog', icon: PackagePlus, title: 'Create product', description: 'Publish products, SKUs, attributes, and prices.' },
  { to: '/admin/inventory', icon: Boxes, title: 'Manage inventory', description: 'Review striped stock and hot-SKU contention.' },
  { to: '/admin/payments', icon: CreditCard, title: 'Inspect payment', description: 'Find the durable payment projection by order.' },
  { to: '/admin/audit', icon: ReceiptText, title: 'Audit workflow', description: 'Trace independent events for an aggregate.' },
];

export function AdminDashboardPage() {
  useDocumentTitle('Operations');
  const inventory = useQuery({ queryKey: queryKeys.inventory, queryFn: ({ signal }) => adminApi.inventory({ signal }) });
  const hot = useQuery({ queryKey: queryKeys.hotSkus, queryFn: ({ signal }) => adminApi.hotSkus(20, { signal }), refetchInterval: 15_000 });
  if (inventory.isPending || hot.isPending) return <div className="page"><LoadingState label="Loading operations" /></div>;
  const available = inventory.data?.reduce((sum, item) => sum + item.availableQuantity, 0) ?? 0;
  const reserved = inventory.data?.reduce((sum, item) => sum + item.reservedQuantity, 0) ?? 0;
  const contentions = hot.data?.reduce((sum, item) => sum + item.contentions, 0) ?? 0;
  return <div className="page stack-lg"><PageHeader eyebrow="Administrator workspace" title="Marketplace operations" description="Operational controls are isolated from customer routes and require the ADMIN role." /><section className="stats-grid"><StatCard label="Available units" value={available} helper={`${inventory.data?.length ?? 0} SKUs`} icon={<Boxes />} /><StatCard label="Reserved units" value={reserved} helper="Awaiting checkout completion" icon={<Activity />} /><StatCard label="Hot-SKU contentions" value={contentions} helper="Rolling per-replica window" icon={<Flame />} /></section><section className="operation-grid">{operations.map(({ to, icon: Icon, title, description }) => <Link to={to} key={to}><Card className="operation-card"><div className="operation-card__icon"><Icon /></div><h2>{title}</h2><p>{description}</p><span>Open workspace →</span></Card></Link>)}</section></div>;
}
