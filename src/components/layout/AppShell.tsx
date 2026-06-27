import { CreditCard, Gauge, LogOut, Menu, PackageSearch, ReceiptText, Settings, ShoppingBag, ShoppingCart, Truck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { appConfig } from '../../api/config';
import { useAuth } from '../../auth/AuthProvider';
import { formatDateTime } from '../../utils/format';
import { Button } from '../ui/Button';

const customerLinks = [
  { to: '/', label: 'Overview', icon: Gauge },
  { to: '/catalog', label: 'Marketplace', icon: ShoppingBag },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/orders/track', label: 'Track order', icon: Truck },
];

const adminLinks = [
  { to: '/admin', label: 'Operations', icon: Settings },
  { to: '/admin/catalog', label: 'Product setup', icon: PackageSearch },
  { to: '/admin/inventory', label: 'Inventory', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/audit', label: 'Audit trail', icon: ReceiptText },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin, logout } = useAuth();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  const closeNavigation = () => setOpen(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar__brand">
          <img src="/brand-mark.svg" alt="" />
          <div><strong>{appConfig.appName}</strong><span>Commerce banking</span></div>
          <button ref={closeButtonRef} className="icon-button sidebar__close" onClick={closeNavigation} aria-label="Close navigation"><X /></button>
        </div>
        <nav>
          <p className="nav-label">Customer</p>
          {customerLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={closeNavigation}><Icon size={19} /><span>{label}</span></NavLink>)}
          {isAdmin ? <><p className="nav-label">Administration</p>{adminLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={closeNavigation}><Icon size={19} /><span>{label}</span></NavLink>)}</> : null}
        </nav>
        <div className="sidebar__profile">
          <div className="avatar" aria-hidden>{session?.email.slice(0, 1).toUpperCase()}</div>
          <div><strong>{session?.email}</strong><span>{isAdmin ? 'Administrator' : 'Customer'}</span></div>
        </div>
      </aside>
      {open ? <button className="sidebar-backdrop" onClick={closeNavigation} aria-label="Close navigation overlay" /> : null}
      <div className="app-shell__body">
        <header className="topbar">
          <button ref={menuButtonRef} className="icon-button topbar__menu" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}><Menu /></button>
          <div className="topbar__security">
            <span className="topbar__status"><span /> Secure connection</span>
            {session ? <span className="topbar__expiry" title={formatDateTime(session.expiresAt)}>Session expires {new Date(session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> : null}
          </div>
          <Button variant="ghost" size="sm" icon={LogOut} onClick={logout}>Sign out</Button>
        </header>
        <main id="main-content" className="main-content"><Outlet /></main>
        <footer className="footer"><span>© 2026 Atlas Marketplace</span><span>Protected checkout · Saga orchestration · Idempotent payments</span></footer>
      </div>
    </div>
  );
}
