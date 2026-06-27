import { useQuery } from '@tanstack/react-query';
import { Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { adminApi, queryKeys } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorAlert } from '../../components/ui/Feedback';
import { FieldFrame, Input } from '../../components/ui/FormField';
import { Badge, Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, humanize } from '../../utils/format';

export function AuditPage() {
  useDocumentTitle('Audit trail');
  const [value, setValue] = useState('');
  const [aggregateId, setAggregateId] = useState('');
  const audit = useQuery({ queryKey: queryKeys.audit(aggregateId), queryFn: ({ signal }) => adminApi.auditByAggregate(aggregateId, { signal }), enabled: Boolean(aggregateId), retry: false });
  return <div className="page stack-lg"><PageHeader eyebrow="Independent audit" title="Aggregate event trail" description="Audit entries are persisted outside parent business transactions and remain visible after failures." /><Card className="lookup-card"><FieldFrame label="Aggregate ID" htmlFor="aggregate-id"><div className="input-action"><Input id="aggregate-id" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Order, payment, or shipment identifier" /><Button icon={Search} loading={audit.isFetching} onClick={() => setAggregateId(value.trim())}>Search audit</Button></div></FieldFrame></Card>{audit.isError ? <ErrorAlert error={audit.error} /> : audit.data?.length === 0 ? <EmptyState title="No audit entries" message="No events were found for this aggregate identifier." /> : audit.data ? <Card className="audit-timeline"><div className="panel-heading"><div><p className="eyebrow">Append-only history</p><h2>{audit.data.length} events</h2></div><ShieldCheck /></div>{audit.data.map((entry) => <article key={entry.id}><div className="audit-timeline__marker" /><div className="audit-timeline__header"><div><strong>{humanize(entry.action)}</strong><span>{entry.source} · {entry.aggregateType}</span></div><Badge tone={entry.outcome === 'SUCCESS' ? 'success' : entry.outcome === 'FAILED' ? 'danger' : 'info'}>{humanize(entry.outcome)}</Badge></div><p>{entry.details || 'No additional details'}</p><small>{formatDateTime(entry.occurredAt)} · Event {entry.eventId}</small></article>)}</Card> : null}</div>;
}
