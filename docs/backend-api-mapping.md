# Backend API mapping

| Frontend capability | Backend endpoint |
|---|---|
| Registration | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Product catalog | `GET /api/catalog/products` |
| Product detail | `GET /api/catalog/products/{productId}` |
| SKU detail | `GET /api/catalog/skus/{skuId}` |
| Read cart | `GET /api/cart` |
| Add or update cart item | `PUT /api/cart/items` |
| Remove cart item | `DELETE /api/cart/items/{skuId}` |
| Clear cart | `DELETE /api/cart` |
| Submit checkout | `POST /api/orders/checkout` with `Idempotency-Key` |
| Track order/Saga | `GET /api/orders/{orderId}` |
| Read shipment | `GET /api/shipping/orders/{orderId}` |
| Create product | `POST /api/admin/catalog/products` |
| Read inventory | `GET /api/admin/inventory` |
| Set stock | `PUT /api/admin/inventory` |
| Diagnose hot SKUs | `GET /api/admin/inventory/hot-skus` |
| Inspect payment | `GET /api/admin/payments/orders/{orderId}` |
| Inspect audit history | `GET /api/admin/audit/{aggregateId}` |

The frontend intentionally does not expose or display the persisted payment token returned by the administrative payment projection.
