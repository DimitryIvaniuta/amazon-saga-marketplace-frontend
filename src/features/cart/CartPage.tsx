import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { cartApi, queryKeys } from '../../api/endpoints';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorAlert, LoadingState, QueryErrorState } from '../../components/ui/Feedback';
import { Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatMoney } from '../../utils/format';
import { useCatalogIndex } from '../catalog/useCatalogIndex';

export function CartPage() {
  useDocumentTitle('Cart');
  const client = useQueryClient();
  const { notify } = useToast();
  const cart = useQuery({ queryKey: queryKeys.cart, queryFn: ({ signal }) => cartApi.get({ signal }) });
  const catalog = useCatalogIndex();
  const update = useMutation({
    mutationKey: ['cart', 'update'],
    scope: { id: 'cart-mutations' },
    mutationFn: ({ skuId, quantity }: { skuId: string; quantity: number }) => quantity > 0 ? cartApi.setItem(skuId, quantity) : cartApi.removeItem(skuId),
    onSuccess: (data, variables) => {
      client.setQueryData(queryKeys.cart, data);
      if (variables.quantity === 0) notify('Item removed from your cart.', 'success');
    },
  });
  const clear = useMutation({
    mutationKey: ['cart', 'clear'],
    scope: { id: 'cart-mutations' },
    mutationFn: cartApi.clear,
    onSuccess: (data) => {
      client.setQueryData(queryKeys.cart, data);
      notify('Cart cleared.', 'success');
    },
  });
  const total = cart.data?.items.reduce((sum, item) => sum + (catalog.entries.get(item.skuId)?.variant.priceMinor ?? 0) * item.quantity, 0) ?? 0;
  const currency = cart.data?.items.map((item) => catalog.entries.get(item.skuId)?.variant.currency).find(Boolean) ?? 'PLN';
  const mutationPending = update.isPending || clear.isPending;

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Purchase account" title="Shopping cart" description="Review quantities before inventory is reserved during checkout." actions={cart.data?.items.length ? <Button variant="ghost" icon={Trash2} loading={clear.isPending} disabled={update.isPending} onClick={() => clear.mutate()}>Clear cart</Button> : null} />
      {update.isError ? <ErrorAlert error={update.error} /> : null}
      {clear.isError ? <ErrorAlert error={clear.error} /> : null}
      {cart.isPending || catalog.isPending ? <LoadingState label="Loading cart" /> : cart.isError ? <QueryErrorState error={cart.error} onRetry={() => void cart.refetch()} /> : !cart.data.items.length ? <EmptyState title="Your cart is empty" message="Browse the marketplace and add a product variant to continue." action={<Link className="button button--primary button--md" to="/catalog"><ShoppingBag size={17} /> Browse products</Link>} /> : <div className="cart-layout">
        <Card className="cart-lines" aria-busy={mutationPending || undefined}>
          {cart.data.items.map((item) => {
            const entry = catalog.entries.get(item.skuId);
            const itemName = entry?.product.name ?? item.skuId;
            return <article className="cart-line" key={item.skuId}>
              <div className="cart-line__visual">{entry?.product.name.slice(0, 2).toUpperCase() ?? 'SKU'}</div>
              <div className="cart-line__details"><Link to={entry ? `/catalog/${entry.product.id}` : '/catalog'}>{itemName}</Link><span>{entry?.variant.skuCode}</span><small>{entry ? Object.entries(entry.variant.attributes).map(([key, value]) => `${key}: ${value}`).join(' · ') : 'Catalog detail unavailable'}</small></div>
              <div className="quantity-control" aria-label={`Quantity for ${itemName}`}>
                <button disabled={mutationPending} onClick={() => update.mutate({ skuId: item.skuId, quantity: item.quantity - 1 })} aria-label={`Decrease ${itemName} quantity`}><Minus /></button>
                <output aria-live="polite">{item.quantity}</output>
                <button disabled={mutationPending || item.quantity >= 99} onClick={() => update.mutate({ skuId: item.skuId, quantity: item.quantity + 1 })} aria-label={`Increase ${itemName} quantity`}><Plus /></button>
              </div>
              <strong>{entry ? formatMoney(entry.variant.priceMinor * item.quantity, entry.variant.currency) : '—'}</strong>
              <button disabled={mutationPending} className="icon-button icon-button--danger" onClick={() => update.mutate({ skuId: item.skuId, quantity: 0 })} aria-label={`Remove ${itemName}`}><Trash2 /></button>
            </article>;
          })}
        </Card>
        <Card className="cart-summary">
          <p className="eyebrow">Order summary</p><h2>Payment overview</h2>
          <dl><div><dt>Items</dt><dd>{cart.data.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div><div><dt>Subtotal</dt><dd>{formatMoney(total, currency)}</dd></div><div><dt>Shipping</dt><dd>Calculated by service</dd></div><div className="cart-summary__total"><dt>Total</dt><dd>{formatMoney(total, currency)}</dd></div></dl>
          <p className="cart-summary__note">Stock remains available to other buyers until checkout creates an atomic reservation.</p>
          <Link aria-disabled={mutationPending} className="button button--primary button--lg" to="/checkout">Continue to secure checkout</Link>
        </Card>
      </div>}
    </div>
  );
}
