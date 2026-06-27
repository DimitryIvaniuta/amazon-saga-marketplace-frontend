import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Box, CheckCircle2, Clock3, ShoppingBag, ShoppingCart, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { cartApi, orderApi, queryKeys } from '../../api/endpoints';
import { Badge, Card, PageHeader, StatCard } from '../../components/ui/Surface';
import { LoadingState } from '../../components/ui/Feedback';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, formatMoney, humanize, shortId } from '../../utils/format';
import { recentOrderStorage } from '../../utils/recentOrder';
import { useCatalogIndex } from '../catalog/useCatalogIndex';

export function DashboardPage() {
  useDocumentTitle('Overview');
  const cart = useQuery({ queryKey: queryKeys.cart, queryFn: ({ signal }) => cartApi.get({ signal }) });
  const catalog = useCatalogIndex();
  const lastOrderId = recentOrderStorage.read();
  const order = useQuery({ queryKey: queryKeys.order(lastOrderId ?? ''), queryFn: ({ signal }) => orderApi.byId(lastOrderId ?? '', { signal }), enabled: Boolean(lastOrderId), refetchInterval: (query) => isTerminal(query.state.data?.status) ? false : 5_000 });
  const cartTotal = cart.data?.items.reduce((sum, item) => sum + (catalog.entries.get(item.skuId)?.variant.priceMinor ?? 0) * item.quantity, 0) ?? 0;
  const currency = cart.data?.items.map((item) => catalog.entries.get(item.skuId)?.variant.currency).find(Boolean) ?? 'PLN';

  return <div className="page stack-lg"><PageHeader eyebrow="Account overview" title="Good to see you" description="Monitor your current purchase journey and continue where you left off." actions={<Link className="button button--primary button--md" to="/catalog"><ShoppingBag size={17} /> Browse products</Link>} /><section className="stats-grid"><StatCard label="Cart value" value={formatMoney(cartTotal, currency)} helper={`${cart.data?.items.length ?? 0} line items`} icon={<ShoppingCart />} /><StatCard label="Latest order" value={lastOrderId ? shortId(lastOrderId) : 'No orders'} helper={order.data ? humanize(order.data.status) : 'Start with a new purchase'} icon={<Box />} /><StatCard label="Fulfillment" value={order.data ? humanize(order.data.sagaState) : 'Not started'} helper={order.data ? formatDateTime(order.data.updatedAt) : 'Updates appear in real time'} icon={<Truck />} /></section><section className="dashboard-grid"><Card className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">Current cart</p><h2>Ready for checkout</h2></div><Link to="/cart">Open cart <ArrowRight size={16} /></Link></div>{cart.isPending || catalog.isPending ? <LoadingState label="Loading cart" /> : cart.data?.items.length ? <div className="compact-list">{cart.data.items.slice(0, 4).map((item) => { const entry = catalog.entries.get(item.skuId); return <div key={item.skuId}><div><strong>{entry?.product.name ?? shortId(item.skuId)}</strong><span>{entry?.variant.skuCode ?? 'SKU'} · Quantity {item.quantity}</span></div><strong>{entry ? formatMoney(entry.variant.priceMinor * item.quantity, entry.variant.currency) : '—'}</strong></div>; })}</div> : <div className="inline-empty"><ShoppingCart /><div><strong>Your cart is empty</strong><span>Add a product to begin a protected checkout.</span></div></div>}</Card><Card className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">Saga activity</p><h2>Latest workflow</h2></div>{lastOrderId ? <Link to={`/orders/${lastOrderId}`}>View details <ArrowRight size={16} /></Link> : null}</div>{lastOrderId && order.data ? <div className="order-summary"><div className="order-summary__top"><div><span>Order</span><strong>{shortId(order.data.orderId)}</strong></div><Badge tone={isTerminal(order.data.status) ? 'success' : 'warning'}>{humanize(order.data.status)}</Badge></div><div className="progress-rail"><span className="progress-rail__active" /><span className={order.data.status === 'COMPLETED' ? 'progress-rail__active' : ''} /><span className={order.data.status === 'COMPLETED' ? 'progress-rail__active' : ''} /></div><div className="progress-labels"><span><CheckCircle2 /> Created</span><span><Clock3 /> Processing</span><span><Truck /> Fulfilled</span></div><div className="order-summary__amount"><span>Total</span><strong>{formatMoney(order.data.totalMinor, order.data.currency)}</strong></div></div> : <div className="inline-empty"><Box /><div><strong>No recent order</strong><span>Your latest checkout status will appear here.</span></div></div>}</Card></section></div>;
}

function isTerminal(status?: string): boolean {
  return ['COMPLETED', 'CANCELLED', 'MANUAL_INTERVENTION'].includes(status ?? '');
}
