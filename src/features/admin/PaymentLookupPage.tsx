import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { adminApi, queryKeys } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { ErrorAlert } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { Badge, Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, formatMoney, humanize } from '../../utils/format';

export function PaymentLookupPage() {
  useDocumentTitle('Payment operations');
  const [value, setValue] = useState('');
  const [orderId, setOrderId] = useState('');
  const payment = useQuery({ queryKey: queryKeys.payment(orderId), queryFn: ({ signal }) => adminApi.paymentByOrder(orderId, { signal }), enabled: Boolean(orderId), retry: false });
  return <div className="page stack-lg"><PageHeader eyebrow="Payment operations" title="Payment projection" description="Inspect durable payment state without exposing provider secrets to customer routes." /><Card className="lookup-card"><FieldFrame label="Order ID" htmlFor="payment-order"><div className="input-action"><Input id="payment-order" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Order UUID" /><Button icon={Search} loading={payment.isFetching} onClick={() => setOrderId(value.trim())}>Find payment</Button></div></FieldFrame></Card>{payment.isError ? <ErrorAlert error={payment.error} /> : payment.data ? <div className="payment-grid"><Card className="payment-primary"><div className="payment-primary__icon"><CreditCard /></div><p className="eyebrow">Payment status</p><h2>{formatMoney(payment.data.amountMinor, payment.data.currency)}</h2><Badge tone={payment.data.status.includes('FAILED') ? 'danger' : payment.data.status === 'CAPTURED' ? 'success' : 'warning'}>{humanize(payment.data.status)}</Badge><dl><div><dt>Order</dt><dd>{payment.data.orderId}</dd></div><div><dt>Provider payment</dt><dd>{payment.data.providerPaymentId ?? 'Not assigned'}</dd></div><div><dt>Provider reference</dt><dd>{payment.data.providerReference ?? 'Not assigned'}</dd></div><div><dt>Version</dt><dd>{payment.data.version}</dd></div><div><dt>Updated</dt><dd>{formatDateTime(payment.data.updatedAt)}</dd></div></dl></Card><Card className="payment-note"><ShieldAlert /><h2>Sensitive fields</h2><p>The backend projection may contain an opaque payment token only while authorization is unresolved. The UI never renders that token.</p><div><span>Authorization key</span><code>{payment.data.authorizationKey}</code></div></Card></div> : null}</div>;
}
