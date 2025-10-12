/**
 * Link Component con Prefetch Automático
 * Versión optimizada de React Router Link que pre-carga rutas
 */

import React, { useRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface PrefetchLinkProps extends LinkProps {
  prefetchOn?: 'hover' | 'mount' | 'viewport';
  prefetchDelay?: number;
  onPrefetch?: () => Promise<any>;
}

/**
 * Link con prefetching automático
 * Pre-carga el contenido de la ruta cuando se hace hover
 */
export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  prefetchOn = 'hover',
  prefetchDelay = 0,
  onPrefetch,
  children,
  ...linkProps
}) => {
  const prefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handlePrefetch = () => {
    if (!onPrefetch || prefetchedRef.current) return;

    if (prefetchDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        prefetchedRef.current = true;
        onPrefetch().catch(console.warn);
      }, prefetchDelay);
    } else {
      prefetchedRef.current = true;
      onPrefetch().catch(console.warn);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Prefetch en mount
  React.useEffect(() => {
    if (prefetchOn === 'mount') {
      handlePrefetch();
    }
  }, [prefetchOn]);

  // Prefetch en viewport (Intersection Observer)
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  React.useEffect(() => {
    if (prefetchOn !== 'viewport' || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handlePrefetch();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(linkRef.current);

    return () => observer.disconnect();
  }, [prefetchOn]);

  const eventHandlers =
    prefetchOn === 'hover'
      ? {
          onMouseEnter: handlePrefetch,
          onMouseLeave: handleMouseLeave,
          onFocus: handlePrefetch,
        }
      : {};

  return (
    <Link ref={linkRef} {...linkProps} {...eventHandlers}>
      {children}
    </Link>
  );
};

export default PrefetchLink;
