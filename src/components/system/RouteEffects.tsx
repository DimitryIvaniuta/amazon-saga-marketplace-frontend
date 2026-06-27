import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/** Announces SPA navigations and moves keyboard focus to the page landmark. */
export function RouteEffects() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content');
      main?.setAttribute('tabindex', '-1');
      main?.focus({ preventScroll: true });
      setAnnouncement(document.title);
    });
  }, [location.pathname, location.search]);

  return <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>;
}
