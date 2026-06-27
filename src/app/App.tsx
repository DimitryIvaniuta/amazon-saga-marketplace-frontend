import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { AdminRoute, GuestRoute, ProtectedRoute } from '../auth/RouteGuards';
import { AppShell } from '../components/layout/AppShell';
import { PublicLayout } from '../components/layout/PublicLayout';
import { LoadingState } from '../components/ui/Feedback';

// Route-level splitting keeps customer and administrator workspaces out of the
// initial bundle until the user actually navigates to them.
const LoginPage = lazyNamed(() => import('../features/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('../features/auth/RegisterPage'), 'RegisterPage');
const CatalogPage = lazyNamed(() => import('../features/catalog/CatalogPage'), 'CatalogPage');
const ProductPage = lazyNamed(() => import('../features/catalog/ProductPage'), 'ProductPage');
const CartPage = lazyNamed(() => import('../features/cart/CartPage'), 'CartPage');
const CheckoutPage = lazyNamed(() => import('../features/checkout/CheckoutPage'), 'CheckoutPage');
const DashboardPage = lazyNamed(() => import('../features/dashboard/DashboardPage'), 'DashboardPage');
const OrderTrackingPage = lazyNamed(() => import('../features/orders/OrderTrackingPage'), 'OrderTrackingPage');
const AdminDashboardPage = lazyNamed(() => import('../features/admin/AdminDashboardPage'), 'AdminDashboardPage');
const ProductCreatePage = lazyNamed(() => import('../features/admin/ProductCreatePage'), 'ProductCreatePage');
const InventoryPage = lazyNamed(() => import('../features/admin/InventoryPage'), 'InventoryPage');
const PaymentLookupPage = lazyNamed(() => import('../features/admin/PaymentLookupPage'), 'PaymentLookupPage');
const AuditPage = lazyNamed(() => import('../features/admin/AuditPage'), 'AuditPage');
const ShippingPage = lazyNamed(() => import('../features/shipping/ShippingPage'), 'ShippingPage');
const NotFoundPage = lazyNamed(() => import('../features/NotFoundPage'), 'NotFoundPage');

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/catalog" replace />;
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Suspense fallback={<div className="page"><LoadingState label="Loading workspace" /></div>}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:productId" element={<ProductPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/track" element={<OrderTrackingPage />} />
            <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
            <Route path="/shipping/:orderId" element={<ShippingPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/catalog" element={<ProductCreatePage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/payments" element={<PaymentLookupPage />} />
              <Route path="/admin/audit" element={<AuditPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/home" element={<HomeRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

function lazyNamed<TModule, TName extends keyof TModule>(
  loader: () => Promise<TModule>,
  name: TName,
) {
  return lazy(async () => ({ default: (await loader())[name] as ComponentType }));
}
