import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Boxes, Download, Flame, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminApi, queryKeys } from '../../api/endpoints';
import type { HotSku, InventoryStock } from '../../api/types';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ErrorAlert, LoadingState, QueryErrorState } from '../../components/ui/Feedback';
import { Input } from '../../components/ui/FormField';
import { Badge, Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { downloadCsv } from '../../utils/csv';
import { formatDateTime, shortId } from '../../utils/format';

export function InventoryPage() {
  useDocumentTitle('Inventory');
  const [filter, setFilter] = useState('');
  const inventory = useQuery({ queryKey: queryKeys.inventory, queryFn: ({ signal }) => adminApi.inventory({ signal }) });
  const hot = useQuery({ queryKey: queryKeys.hotSkus, queryFn: ({ signal }) => adminApi.hotSkus(50, { signal }), refetchInterval: 10_000 });
  const filteredInventory = useMemo(() => {
    const value = filter.trim().toLowerCase();
    return value ? (inventory.data ?? []).filter((item) => item.skuId.toLowerCase().includes(value)) : inventory.data ?? [];
  }, [filter, inventory.data]);
  const sortedHot = useMemo(() => [...(hot.data ?? [])].sort((left, right) => right.contentions - left.contentions || right.attempts - left.attempts), [hot.data]);

  const exportInventory = () => {
    const diagnostics = new Map((hot.data ?? []).map((item) => [item.skuId, item]));
    downloadCsv(`inventory-${new Date().toISOString().slice(0, 10)}.csv`, (inventory.data ?? []).map((stock) => {
      const diagnostic = diagnostics.get(stock.skuId);
      return {
        skuId: stock.skuId,
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity,
        soldQuantity: stock.soldQuantity,
        bucketCount: stock.bucketCount,
        attempts: diagnostic?.attempts ?? 0,
        contentions: diagnostic?.contentions ?? 0,
        insufficient: diagnostic?.insufficient ?? 0,
        averageMicros: diagnostic?.averageMicros ?? 0,
        updatedAt: stock.updatedAt,
      };
    }));
  };

  return (
    <div className="page stack-lg">
      <PageHeader
        eyebrow="Stock control"
        title="Inventory and hot SKUs"
        description="Striped buckets reduce lock contention while preserving exact aggregate stock."
        actions={<div className="page-header__actions"><Button variant="secondary" icon={Download} disabled={!inventory.data?.length} onClick={exportInventory}>Export CSV</Button><Button variant="secondary" icon={RefreshCw} loading={inventory.isFetching || hot.isFetching} onClick={() => { void inventory.refetch(); void hot.refetch(); }}>Refresh</Button></div>}
      />
      {inventory.isPending || hot.isPending ? <LoadingState label="Loading stock" /> : inventory.isError ? <QueryErrorState error={inventory.error} onRetry={() => void inventory.refetch()} /> : <>
        <section className="stats-grid">
          <Card className="stat-card"><div className="stat-card__icon"><Boxes /></div><div><span>Total SKUs</span><strong>{inventory.data.length}</strong><small>16 stripes per new SKU</small></div></Card>
          <Card className="stat-card"><div className="stat-card__icon"><Activity /></div><div><span>Reserved units</span><strong>{inventory.data.reduce((sum, item) => sum + item.reservedQuantity, 0)}</strong><small>Durable reservations</small></div></Card>
          <Card className="stat-card"><div className="stat-card__icon"><Flame /></div><div><span>Tracked hot SKUs</span><strong>{hot.data?.length ?? 0}</strong><small>10-minute inactivity window</small></div></Card>
        </section>
        <Card>
          <div className="panel-heading inventory-heading"><div><p className="eyebrow">Aggregate stock</p><h2>Inventory projection</h2></div><label className="search-box" htmlFor="inventory-search"><Search size={17} /><span className="sr-only">Filter inventory by SKU</span><Input id="inventory-search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by SKU" /></label></div>
          {filteredInventory.length ? <DataTable label="Inventory stock" headings={['SKU', 'Available', 'Reserved', 'Sold', 'Buckets', 'Updated', 'Set available']}>{filteredInventory.map((stock) => <StockRow stock={stock} key={stock.skuId} />)}</DataTable> : <p className="table-empty">No inventory rows match this SKU filter.</p>}
        </Card>
        <Card>
          <div className="panel-heading"><div><p className="eyebrow">Contention diagnostics</p><h2>Hottest SKUs</h2></div><Badge tone="info">Per replica</Badge></div>
          {hot.isError ? <ErrorAlert error={hot.error} /> : <DataTable label="Hot SKU diagnostics" headings={['SKU', 'Attempts', 'Contentions', 'Insufficient', 'Average latency']}>{sortedHot.map((item) => <HotSkuRow item={item} key={item.skuId} />)}</DataTable>}
        </Card>
      </>}
    </div>
  );
}

function StockRow({ stock }: { stock: InventoryStock }) {
  const [quantity, setQuantity] = useState(stock.availableQuantity);
  const client = useQueryClient();
  const { notify } = useToast();
  const update = useMutation({
    mutationFn: () => adminApi.setStock(stock.skuId, quantity),
    onSuccess: async () => {
      notify(`Available stock updated for ${shortId(stock.skuId)}.`, 'success');
      await client.invalidateQueries({ queryKey: queryKeys.inventory });
    },
  });
  return <tr><td title={stock.skuId}>{shortId(stock.skuId)}</td><td>{stock.availableQuantity}</td><td>{stock.reservedQuantity}</td><td>{stock.soldQuantity}</td><td>{stock.bucketCount}</td><td>{formatDateTime(stock.updatedAt)}</td><td><div className="table-action"><Input aria-label={`Available quantity for ${stock.skuId}`} type="number" min={0} value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value)))} /><Button size="sm" loading={update.isPending} disabled={quantity === stock.availableQuantity} onClick={() => update.mutate()}>Update</Button></div>{update.isError ? <small className="field__error">Update failed</small> : null}</td></tr>;
}

function HotSkuRow({ item }: { item: HotSku }) {
  const contentionRate = item.attempts ? (item.contentions / item.attempts) * 100 : 0;
  return <tr><td title={item.skuId}>{shortId(item.skuId)}</td><td>{item.attempts.toLocaleString()}</td><td>{item.contentions.toLocaleString()} <small>({contentionRate.toFixed(2)}%)</small></td><td>{item.insufficient.toLocaleString()}</td><td>{item.averageMicros.toLocaleString()} µs</td></tr>;
}
