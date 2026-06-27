import { ArrowUpRight, Layers3 } from 'lucide-react';
import { Link } from 'react-router';
import type { Product } from '../../api/types';
import { Badge, Card } from '../../components/ui/Surface';
import { formatMoney } from '../../utils/format';

export function ProductCard({ product }: { product: Product }) {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const prices = activeVariants.map((variant) => variant.priceMinor);
  const minimum = prices.length ? Math.min(...prices) : 0;
  const currency = activeVariants[0]?.currency ?? 'PLN';

  return (
    <Card className="product-card">
      <div className="product-card__visual"><Layers3 size={42} /><Badge tone="success">Available</Badge></div>
      <div className="product-card__body">
        <p className="eyebrow">{product.category}</p>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="product-card__meta"><span>From <strong>{formatMoney(minimum, currency)}</strong></span><span>{activeVariants.length} variant{activeVariants.length === 1 ? '' : 's'}</span></div>
        <Link to={`/catalog/${product.id}`} className="product-card__link">View product <ArrowUpRight size={18} /></Link>
      </div>
    </Card>
  );
}
