/**
 * Performance Monitor Component
 * Mide y reporta métricas de performance de la aplicación
 */

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  loadTime?: number;
  domInteractive?: number;
}

/**
 * Hook para monitorear métricas de performance
 */
export const usePerformanceMonitor = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Esperar a que la página esté completamente cargada
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [enabled]);

  const measurePerformance = () => {
    const metrics: PerformanceMetrics = {};

    // Obtener métricas de Navigation Timing
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navTiming) {
      metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
      metrics.loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
      metrics.domInteractive = navTiming.domInteractive - navTiming.fetchStart;
    }

    // Obtener métricas de Paint Timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = entry.startTime;
      }
    });

    // Intentar obtener LCP si está disponible
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        
        // Métricas capturadas para LCP
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported in this browser
    }

    // Métricas de performance capturadas

    // Enviar métricas a analytics (cuando esté configurado)
    // sendToAnalytics(metrics);
  };

  const logMetrics = (metrics: PerformanceMetrics) => {
    // Métricas disponibles para analytics cuando esté configurado
    // Se puede enviar a servicio de monitoreo en producción
  };
};

/**
 * Componente Performance Monitor
 * Renderiza información de performance en desarrollo
 */
export const PerformanceMonitor: React.FC<{ enabled?: boolean }> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  usePerformanceMonitor(enabled);
  return null;
};

export default PerformanceMonitor;
