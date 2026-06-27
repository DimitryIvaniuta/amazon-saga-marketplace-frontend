import { useQuery } from '@tanstack/react-query';
import { catalogApi, queryKeys } from '../../api/endpoints';
import type { Product, ProductVariant } from '../../api/types';

export interface CatalogVariantEntry {
  product: Product;
  variant: ProductVariant;
}

export function useCatalogIndex() {
  const query = useQuery({ queryKey: queryKeys.products, queryFn: ({ signal }) => catalogApi.products({ signal }), staleTime: 60_000 });
  const entries = new Map<string, CatalogVariantEntry>();
  query.data?.forEach((product) => product.variants.forEach((variant) => entries.set(variant.id, { product, variant })));
  return { ...query, entries };
}
