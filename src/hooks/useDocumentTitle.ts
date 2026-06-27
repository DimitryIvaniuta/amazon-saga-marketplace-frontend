import { useEffect } from 'react';
import { appConfig } from '../api/config';

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${appConfig.appName}`;
  }, [title]);
}
