import { Link, Outlet } from 'react-router';
import { appConfig } from '../../api/config';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header>
        <Link to="/" className="public-brand"><img src="/brand-mark.svg" alt="" /><span>{appConfig.appName}</span></Link>
        <Link to="/catalog" className="text-link">Browse marketplace</Link>
      </header>
      <main id="main-content">
        <section className="auth-art">
          <div><p className="eyebrow">Secure commerce</p><h1>Every purchase, coordinated with confidence.</h1><p>Real-time inventory reservations, idempotent payments, and transparent order tracking in one professional workspace.</p></div>
          <div className="auth-art__metrics"><div><strong>Atomic</strong><span>Stock reservations</span></div><div><strong>Durable</strong><span>Payment workflow</span></div><div><strong>Observable</strong><span>Order lifecycle</span></div></div>
        </section>
        <section className="auth-panel"><Outlet /></section>
      </main>
      <footer>Atlas Marketplace · Production demonstration portal</footer>
    </div>
  );
}
