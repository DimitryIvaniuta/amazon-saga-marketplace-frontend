import { useQuery } from '@tanstack/react-query';
import { Check, CircleAlert, Clock3, Copy, PackageCheck, RefreshCw, Search, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { appConfig } from '../../api/config';
import { orderApi, queryKeys } from '../../api/endpoints';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { ErrorAlert, LoadingState } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { Badge, Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, formatMoney, humanize } from '../../utils/format';
import { isUuid, recentOrderStorage } from '../../utils/recentOrder';

const terminal = new Set(['COMPLETED', 'CANCELLED', 'MANUAL_INTERVENTION']);

export function OrderTrackingPage() {
  useDocumentTitle('Order tracking');
  const params = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [lookupId, setLookupId] = useState(params.orderId ?? recentOrderStorage.read() ?? '');
  const [lookupError, setLookupError] = useState<string>();
  const orderId = params.orderId ?? '';
  const order = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: ({ signal }) => orderApi.byId(orderId, { signal }),
    enabled: Boolean(orderId),
    // Poll only while the backend Saga is non-terminal; the cadence is runtime configurable.
    refetchInterval: (query) => terminal.has(query.state.data?.status ?? '') ? false : appConfig.orderPollingMs,
  });

  const search = () => {
    const value = lookupId.trim();
    if (!isUuid(value)) {
      setLookupError('Enter a valid UUID order identifier.');
      return;
    }
    setLookupError(undefined);
    void navigate(`/orders/${value}`);
  };

  return <div className="page stack-lg"><PageHeader eyebrow="Durable workflow" title="Order tracking" description="Follow inventory, payment, and shipping as the Saga reaches a terminal state." actions={orderId ? <Button variant="secondary" icon={RefreshCw} loading={order.isFetching} onClick={() => void order.refetch()}>Refresh</Button> : null} /><Card className="lookup-card"><FieldFrame label="Order ID" htmlFor="order-id" error={lookupError}><div className="input-action"><Input id="order-id" value={lookupId} onChange={(event) => { setLookupId(event.target.value); setLookupError(undefined); }} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /><Button type="button" icon={Search} onClick={search}>Track</Button></div></FieldFrame></Card>{orderId && order.isPending ? <LoadingState label="Loading order" /> : order.isError ? <ErrorAlert error={order.error} /> : order.data ? <><Card className="order-hero"><div><p className="eyebrow">Order reference</p><div className="copy-value"><h2>{order.data.orderId}</h2><button className="icon-button" aria-label="Copy order ID" onClick={() => { void navigator.clipboard.writeText(order.data.orderId).then(() => notify('Order ID copied.', 'success')); }}><Copy /></button></div><p>Created {formatDateTime(order.data.createdAt)}</p></div><div className="order-hero__amount"><Badge tone={statusTone(order.data.status)}>{humanize(order.data.status)}</Badge><strong>{formatMoney(order.data.totalMinor, order.data.currency)}</strong></div></Card><Card className="saga-timeline"><h2>Purchase workflow</h2><div className="timeline"><TimelineStep icon={<Check />} title="Order accepted" detail="The idempotent order record and first command were committed." done /><TimelineStep icon={<Clock3 />} title={humanize(order.data.sagaState)} detail="Current durable Saga state." done={!['CREATED', 'INVENTORY_PENDING'].includes(order.data.sagaState)} active={!terminal.has(order.data.status)} /><TimelineStep icon={order.data.status === 'COMPLETED' ? <PackageCheck /> : order.data.status === 'CANCELLED' ? <CircleAlert /> : <Truck />} title={terminal.has(order.data.status) ? humanize(order.data.status) : 'Fulfillment pending'} detail={order.data.failureCode ? `Failure code: ${order.data.failureCode}` : 'Compensation will run automatically if a downstream step fails.'} done={terminal.has(order.data.status)} /></div></Card><Card className="order-lines"><div className="panel-heading"><h2>Order lines</h2><span>Updated {formatDateTime(order.data.updatedAt)}</span></div>{order.data.lines.map((line) => <div key={line.skuId}><div><strong>{line.skuId}</strong><span>Quantity {line.quantity}</span></div><strong>{formatMoney(line.unitPriceMinor * line.quantity, line.currency)}</strong></div>)}</Card>{order.data.status === 'COMPLETED' ? <Link className="button button--primary button--md align-self-start" to={`/shipping/${order.data.orderId}`}><Truck size={17} /> View shipment</Link> : null}</> : <Card className="tracking-placeholder"><PackageCheck /><h2>Enter an order ID</h2><p>Your latest checkout is also remembered in this tab for convenient tracking.</p></Card>}</div>;
}

function TimelineStep({ icon, title, detail, done, active = false }: { icon: React.ReactNode; title: string; detail: string; done: boolean; active?: boolean }) {
  return <div className={`timeline__step ${done ? 'timeline__step--done' : ''} ${active ? 'timeline__step--active' : ''}`}><div className="timeline__icon">{icon}</div><div><strong>{title}</strong><p>{detail}</p></div></div>;
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED' || status === 'MANUAL_INTERVENTION') return 'danger';
  if (status === 'PROCESSING') return 'warning';
  return 'info';
}
