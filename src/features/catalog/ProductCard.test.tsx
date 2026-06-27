import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProductCard } from './ProductCard';

const product = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Premium Cotton T-Shirt',
  description: 'Organic cotton.',
  category: 'Clothing',
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  variants: [{ id: '20000000-0000-0000-0000-000000000001', skuCode: 'TSHIRT-BLK-M', attributes: { color: 'black', size: 'M' }, priceMinor: 7999, currency: 'PLN', active: true }],
};

describe('ProductCard', () => {
  it('renders product metadata and detail link', () => {
    render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: product.name })).toBeVisible();
    expect(screen.getByRole('link', { name: /view product/i })).toHaveAttribute('href', `/catalog/${product.id}`);
  });
});
