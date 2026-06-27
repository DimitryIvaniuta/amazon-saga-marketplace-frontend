import { useQuery } from '@tanstack/react-query';
import { Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useDeferredValue, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { catalogApi, queryKeys } from '../../api/endpoints';
import type { Product } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { EmptyState, LoadingState, QueryErrorState } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/FormField';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MarketplaceHeader } from './MarketplaceHeader';
import { ProductCard } from './ProductCard';

type CatalogSort = 'relevance' | 'name' | 'price-low' | 'price-high' | 'newest';

export function CatalogPage() {
  useDocumentTitle('Marketplace');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const sort = normalizeSort(searchParams.get('sort'));
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const products = useQuery({
    queryKey: queryKeys.products,
    queryFn: ({ signal }) => catalogApi.products({ signal }),
    staleTime: 60_000,
  });

  const categories = useMemo(() => [...new Set(products.data?.filter((product) => product.active).map((product) => product.category) ?? [])].sort(), [products.data]);
  const filtered = useMemo(() => {
    const visible = (products.data ?? []).filter((product) => {
      if (!product.active || !product.variants.some((variant) => variant.active)) return false;
      const matchesSearch = !deferredSearch || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(deferredSearch);
      return matchesSearch && (category === 'all' || product.category === category);
    });
    return visible.toSorted((left, right) => compareProducts(left, right, sort, deferredSearch));
  }, [category, deferredSearch, products.data, sort]);

  const updateFilter = (key: string, value: string, defaultValue = '') => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => setSearchParams({}, { replace: true });
  const hasFilters = Boolean(search || category !== 'all' || sort !== 'relevance');

  return (
    <div className="marketplace-page">
      <MarketplaceHeader />
      <main id="main-content">
        <section className="market-hero">
          <div><p className="eyebrow">Marketplace infrastructure you can trust</p><h1>Shop confidently. Every step is protected.</h1><p>Inventory is reserved atomically and payment workflows are coordinated across independent services.</p><div className="market-hero__benefits"><span><ShieldCheck /> Secure checkout</span><span><Zap /> Real-time stock</span><span><Sparkles /> Durable payments</span></div></div>
          <div className="hero-card"><span>Marketplace assurance</span><strong>Built for high-demand products</strong><p>Hot-SKU contention controls prevent overselling during peak traffic.</p></div>
        </section>
        <section className="catalog-section">
          <div className="catalog-toolbar">
            <div><p className="eyebrow">Curated catalog</p><h2>Products</h2><span className="catalog-count" aria-live="polite">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span></div>
            <div className="catalog-filters">
              <label className="search-box" htmlFor="catalog-search"><Search size={18} /><span className="sr-only">Search products</span><Input id="catalog-search" value={search} onChange={(event) => updateFilter('q', event.target.value)} placeholder="Search products" /></label>
              <label htmlFor="catalog-category"><span className="sr-only">Filter by category</span><Select id="catalog-category" value={category} onChange={(event) => updateFilter('category', event.target.value, 'all')}><option value="all">All categories</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</Select></label>
              <label htmlFor="catalog-sort"><span className="sr-only">Sort products</span><Select id="catalog-sort" value={sort} onChange={(event) => updateFilter('sort', event.target.value, 'relevance')}><option value="relevance">Recommended</option><option value="newest">Newest</option><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></Select></label>
              {hasFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button> : null}
            </div>
          </div>
          {products.isPending ? <LoadingState label="Loading products" /> : products.isError ? <QueryErrorState error={products.error} onRetry={() => void products.refetch()} /> : filtered.length === 0 ? <EmptyState title="No products found" message="Try a different search phrase or category." action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined} /> : <div className="product-grid">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div>}
        </section>
      </main>
      <footer className="market-footer">© 2026 Atlas Marketplace · Secure multi-service commerce</footer>
    </div>
  );
}

function normalizeSort(value: string | null): CatalogSort {
  return ['name', 'price-low', 'price-high', 'newest'].includes(value ?? '') ? value as CatalogSort : 'relevance';
}

function compareProducts(left: Product, right: Product, sort: CatalogSort, search: string): number {
  if (sort === 'name') return left.name.localeCompare(right.name);
  if (sort === 'newest') return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  if (sort === 'price-low') return minimumPrice(left) - minimumPrice(right);
  if (sort === 'price-high') return minimumPrice(right) - minimumPrice(left);
  if (search) {
    const leftStarts = left.name.toLowerCase().startsWith(search) ? 0 : 1;
    const rightStarts = right.name.toLowerCase().startsWith(search) ? 0 : 1;
    if (leftStarts !== rightStarts) return leftStarts - rightStarts;
  }
  return left.name.localeCompare(right.name);
}

function minimumPrice(product: Product): number {
  const prices = product.variants.filter((variant) => variant.active).map((variant) => variant.priceMinor);
  return prices.length ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
}
