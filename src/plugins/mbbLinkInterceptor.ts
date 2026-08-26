import { useEffect } from 'react';

export function setupMbbLinkInterceptor() {
  if (typeof window === 'undefined') return;

  const handleIntercept = (event: MouseEvent) => {
    const target = event.target as HTMLAnchorElement;
    if (target && target.tagName === 'A' && target.href) {
      const href = target.href;
      if (href.startsWith('mbb://') || href.startsWith('web+mbb://')) {
        event.preventDefault();
        console.log('Intercepted MBB link:', href);
        // Custom action dispatching event or handling route
        const customEvent = new CustomEvent('mbb-link-triggered', { detail: { url: href } });
        window.dispatchEvent(customEvent);
      }
    }
  };

  window.addEventListener('click', handleIntercept);
  return () => {
    window.removeEventListener('click', handleIntercept);
  };
}

export function useMbbLinkInterceptor() {
  useEffect(() => {
    return setupMbbLinkInterceptor();
  }, []);
}
