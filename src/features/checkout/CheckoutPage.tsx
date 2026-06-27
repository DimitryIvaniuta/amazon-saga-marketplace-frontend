import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import { cartApi, orderApi, queryKeys } from '../../api/endpoints';
import type { CheckoutRequest } from '../../api/types';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorAlert, LoadingState } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { checkoutIdempotencyKey, completeCheckoutAttempt } from '../../utils/idempotency';
import { formatMoney } from '../../utils/format';
import { recentOrderStorage } from '../../utils/recentOrder';
import { useCatalogIndex } from '../catalog/useCatalogIndex';

const schema = z.object({
  paymentToken: z.string().min(1, 'Payment token is required').max(256),
  recipient: z.string().min(1, 'Recipient is required').max(200),
  addressLine1: z.string().min(1, 'Address is required').max(300),
  city: z.string().min(1, 'City is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(32),
  country: z.string().length(2, 'Use a two-letter country code').transform((value) => value.toUpperCase()),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  useDocumentTitle('Secure checkout');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const cart = useQuery({ queryKey: queryKeys.cart, queryFn: ({ signal }) => cartApi.get({ signal }) });
  const catalog = useCatalogIndex();
  const [failure, setFailure] = useState<unknown>();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { country: 'PL' } });
  const checkout = useMutation({
    mutationKey: ['orders', 'checkout'],
    scope: { id: 'checkout' },
    mutationFn: async (request: CheckoutRequest) => orderApi.checkout(request, await checkoutIdempotencyKey(request)),
    onSuccess: (accepted) => {
      completeCheckoutAttempt();
      recentOrderStorage.write(accepted.orderId);
      notify('Order accepted. Tracking the durable purchase workflow now.', 'success');
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void navigate(`/orders/${accepted.orderId}`, { replace: true, state: { justSubmitted: true } });
    },
  });
  const total = cart.data?.items.reduce((sum, item) => sum + (catalog.entries.get(item.skuId)?.variant.priceMinor ?? 0) * item.quantity, 0) ?? 0;
  const currency = cart.data?.items.map((item) => catalog.entries.get(item.skuId)?.variant.currency).find(Boolean) ?? 'PLN';

  const submit = form.handleSubmit((values) => {
    setFailure(undefined);
    checkout.mutate({ paymentToken: values.paymentToken, shippingAddress: { recipient: values.recipient, addressLine1: values.addressLine1, city: values.city, postalCode: values.postalCode, country: values.country } }, { onError: setFailure });
  });

  if (cart.isPending || catalog.isPending) return <div className="page"><LoadingState label="Preparing checkout" /></div>;
  if (!cart.data?.items.length) return <div className="page"><EmptyState title="Nothing to check out" message="Your cart must contain at least one item." action={<Link className="button button--primary button--md" to="/catalog">Browse products</Link>} /></div>;

  return <div className="page stack-lg"><PageHeader eyebrow="Protected purchase" title="Secure checkout" description="Your request starts a durable Saga. Payment is authorized before stock is committed and captured." /><form onSubmit={submit} className="checkout-layout"><div className="stack"><Card className="form-section"><div className="form-section__heading"><div className="form-section__icon"><MapPin /></div><div><h2>Shipping details</h2><p>Provide the recipient and destination for fulfillment.</p></div></div><div className="form-grid"><FieldFrame label="Recipient" htmlFor="recipient" error={form.formState.errors.recipient?.message}><Input id="recipient" autoComplete="name" invalid={Boolean(form.formState.errors.recipient)} {...form.register('recipient')} /></FieldFrame><FieldFrame label="Country" htmlFor="country" error={form.formState.errors.country?.message}><Input id="country" maxLength={2} autoComplete="country" invalid={Boolean(form.formState.errors.country)} {...form.register('country')} /></FieldFrame><div className="form-grid__wide"><FieldFrame label="Address" htmlFor="address" error={form.formState.errors.addressLine1?.message}><Input id="address" autoComplete="street-address" invalid={Boolean(form.formState.errors.addressLine1)} {...form.register('addressLine1')} /></FieldFrame></div><FieldFrame label="City" htmlFor="city" error={form.formState.errors.city?.message}><Input id="city" autoComplete="address-level2" invalid={Boolean(form.formState.errors.city)} {...form.register('city')} /></FieldFrame><FieldFrame label="Postal code" htmlFor="postal" error={form.formState.errors.postalCode?.message}><Input id="postal" autoComplete="postal-code" invalid={Boolean(form.formState.errors.postalCode)} {...form.register('postalCode')} /></FieldFrame></div></Card><Card className="form-section"><div className="form-section__heading"><div className="form-section__icon"><CreditCard /></div><div><h2>Payment authorization</h2><p>Enter an opaque token supplied by your external payment UI.</p></div></div><FieldFrame label="Payment token" htmlFor="paymentToken" error={form.formState.errors.paymentToken?.message} hint="For the included simulator, use tok_success. Other test tokens are documented in the backend README."><Input id="paymentToken" type="password" autoComplete="off" invalid={Boolean(form.formState.errors.paymentToken)} {...form.register('paymentToken')} /></FieldFrame><div className="security-note"><LockKeyhole size={18} /><span>The token is sent directly to the backend and is never persisted by this frontend.</span></div></Card>{failure ? <ErrorAlert error={failure} /> : null}</div><Card className="checkout-summary"><p className="eyebrow">Review order</p><h2>{formatMoney(total, currency)}</h2><div className="checkout-summary__items">{cart.data.items.map((item) => { const entry = catalog.entries.get(item.skuId); return <div key={item.skuId}><div><strong>{entry?.product.name ?? item.skuId}</strong><span>{entry?.variant.skuCode} · {item.quantity} ×</span></div><strong>{entry ? formatMoney(entry.variant.priceMinor * item.quantity, entry.variant.currency) : '—'}</strong></div>; })}</div><div className="assurance-list"><span><ShieldCheck /> Inventory reservation is atomic</span><span><ShieldCheck /> Payment calls use idempotency keys</span><span><ShieldCheck /> Failed steps trigger compensation</span></div><Button type="submit" size="lg" loading={checkout.isPending}>Authorize and place order</Button><p className="checkout-summary__legal">By continuing, you authorize the configured external payment provider to reserve and capture the displayed amount.</p></Card></form></div>;
}
