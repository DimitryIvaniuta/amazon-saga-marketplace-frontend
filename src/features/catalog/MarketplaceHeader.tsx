import { LogIn, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import { appConfig } from '../../api/config';
import { useAuth } from '../../auth/AuthProvider';

export function MarketplaceHeader() {
  const { isAuthenticated } = useAuth();
  return <header className="market-header"><Link className="market-header__brand" to={isAuthenticated ? '/' : '/catalog'}><img src="/brand-mark.svg" alt="" /><strong>{appConfig.appName}</strong></Link><nav aria-label="Marketplace navigation"><Link to="/catalog">Products</Link>{isAuthenticated ? <><Link to="/cart"><ShoppingCart size={18} /> Cart</Link><Link className="button button--primary button--sm" to="/">Dashboard</Link></> : <Link className="button button--primary button--sm" to="/login"><LogIn size={17} /> Sign in</Link>}</nav></header>;
}
