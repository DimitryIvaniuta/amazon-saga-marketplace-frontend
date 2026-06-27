import type { ReactNode } from 'react';

export function DataTable({ headings, children, label }: { headings: string[]; children: ReactNode; label: string }) {
  return <div className="table-shell"><table><caption className="sr-only">{label}</caption><thead><tr>{headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
