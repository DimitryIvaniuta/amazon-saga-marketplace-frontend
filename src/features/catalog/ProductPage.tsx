import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { cartApi, catalogApi, queryKeys } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthProvider';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorAlert, LoadingState, QueryErrorState } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatMoney } from '../../utils/format';
import { MarketplaceHeader } from './MarketplaceHeader';

export function ProductPage() {
  const { productId = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [selectedSku, setSelectedSku] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const product = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: ({ signal }) => catalogApi.product(productId, { signal }),
    enabled: Boolean(productId),
  });
  useDocumentTitle(product.data?.name ?? 'Product');
  const activeVariants = useMemo(() => product.data?.variants.filter((variant) => variant.active) ?? [], [product.data]);
  const selected = activeVariants.find((variant) => variant.id === selectedSku) ?? activeVariants[0];
  const add = useMutation({
    mutationKey: ['cart', 'add'],
    scope: { id: 'cart-mutations' },
    mutationFn: () => cartApi.setItem(selected?.id ?? '', quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      notify(`${product.data?.name ?? 'Product'} added to your cart.`, 'success');
      void navigate('/cart');
    },
  });

  return (
    <div className="marketplace-page">
      <MarketplaceHeader />
      <main id="main-content" className="product-detail-page">
        <Link to="/catalog" className="back-link"><ChevronLeft size={18} /> Back to products</Link>
        {product.isPending ? <LoadingState label="Loading product" /> : product.isError ? <QueryErrorState error={product.error} onRetry={() => void product.refetch()} /> : !activeVariants.length ? <EmptyState title="Product unavailable" message="This product currently has no active sellable variants." action={<Link className="button button--secondary button--md" to="/catalog">Return to catalog</Link>} /> : <div className="product-detail">
          <div className="product-detail__visual"><span>{product.data.category}</span><strong>{product.data.name.split(' ').map((word) => word[0]).join('').slice(0, 3)}</strong><p>Protected by atomic inventory reservations</p></div>
          <div className="product-detail__content">
            <p className="eyebrow">{product.data.category}</p>
            <h1>{product.data.name}</h1>
            <p className="lead">{product.data.description}</p>
            <div className="feature-line"><Check /> Active catalog item</div>
            <fieldset className="variant-picker">
              <legend>Select a variant</legend>
              {activeVariants.map((variant) => <button key={variant.id} type="button" aria-pressed={variant.id === selected?.id} className={variant.id === selected?.id ? 'variant-option variant-option--selected' : 'variant-option'} onClick={() => setSelectedSku(variant.id)}><div><strong>{variant.skuCode}</strong><span>{Object.entries(variant.attributes).map(([key, value]) => `${key}: ${value}`).join(' · ')}</span></div><span>{formatMoney(variant.priceMinor, variant.currency)}</span></button>)}
            </fieldset>
            <div className="purchase-row">
              <label>Quantity<input className="input quantity-input" type="number" min={1} max={99} inputMode="numeric" value={quantity} onChange={(event) => { const value = Number(event.target.value); setQuantity(Number.isFinite(value) ? Math.max(1, Math.min(99, value)) : 1); }} /></label>
              <div><span>Total</span><strong>{selected ? formatMoney(selected.priceMinor * quantity, selected.currency) : '—'}</strong></div>
            </div>
            {add.isError ? <ErrorAlert error={add.error} /> : null}
            {isAuthenticated ? <Button size="lg" icon={ShoppingCart} loading={add.isPending} disabled={!selected} onClick={() => add.mutate()}>Add to cart</Button> : <Link className="button button--primary button--lg" to="/login" state={{ from: `/catalog/${productId}` }}>Sign in to purchase</Link>}
            <div className="product-trust"><Badge tone="success">Real-time stock protection</Badge><Badge tone="info">Idempotent checkout</Badge></div>
          </div>
        </div>}
      </main>
    </div>
  );
}
