import { Link } from 'react-router';
import { EmptyState } from '../components/ui/Feedback';

export function NotFoundPage() {
  return <main className="standalone-page"><EmptyState title="Page not found" message="The requested page does not exist or is no longer available." action={<Link className="button button--primary button--md" to="/">Return home</Link>} /></main>;
}
