import { useQuery } from '@tanstack/react-query';
import { Box, MapPin, Truck } from 'lucide-react';
import { useParams } from 'react-router';
import { queryKeys, shippingApi } from '../../api/endpoints';
import { LoadingState, QueryErrorState } from '../../components/ui/Feedback';
import { Badge, Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, humanize } from '../../utils/format';

export function ShippingPage() {
  useDocumentTitle('Shipment');
  const { orderId = '' } = useParams();
  const shipment = useQuery({ queryKey: queryKeys.shipment(orderId), queryFn: ({ signal }) => shippingApi.byOrder(orderId, { signal }), enabled: Boolean(orderId) });
  return <div className="page stack-lg"><PageHeader eyebrow="Fulfillment account" title="Shipment details" description="Delivery information is owned by the independent shipping service." />{shipment.isPending ? <LoadingState label="Loading shipment" /> : shipment.isError ? <QueryErrorState error={shipment.error} onRetry={() => void shipment.refetch()} /> : <div className="shipping-grid"><Card className="shipment-card"><div className="shipment-card__icon"><Truck /></div><p className="eyebrow">Tracking number</p><h2>{shipment.data.trackingNumber}</h2><Badge tone="success">{humanize(shipment.data.status)}</Badge><dl><div><dt>Order</dt><dd>{shipment.data.orderId}</dd></div><div><dt>Created</dt><dd>{formatDateTime(shipment.data.createdAt)}</dd></div><div><dt>Updated</dt><dd>{formatDateTime(shipment.data.updatedAt)}</dd></div></dl></Card><Card className="delivery-card"><div className="form-section__heading"><div className="form-section__icon"><MapPin /></div><div><h2>Delivery address</h2><p>Recipient information stored by the shipping service.</p></div></div><address><strong>{shipment.data.recipient}</strong><span>{shipment.data.addressLine1}</span><span>{shipment.data.postalCode} {shipment.data.city}</span><span>{shipment.data.country}</span></address><div className="delivery-card__status"><Box /><div><strong>Shipment created</strong><span>Carrier handoff and delivery events can extend this projection later.</span></div></div></Card></div>}</div>;
}
