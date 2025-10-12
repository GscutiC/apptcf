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
        
        // Log de métricas en desarrollo
        if (process.env.NODE_ENV === 'development') {
          logMetrics(metrics);
        }
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP not supported');
    }

    // Log inicial de métricas disponibles
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => logMetrics(metrics), 1000);
    }

    // Enviar métricas a analytics (cuando esté configurado)
    // sendToAnalytics(metrics);
  };

  const logMetrics = (metrics: PerformanceMetrics) => {
    console.group('📊 Performance Metrics');
    
    if (metrics.ttfb) {
      console.log(`⏱️  TTFB: ${Math.round(metrics.ttfb)}ms`);
    }
    
    if (metrics.fcp) {
      const fcpColor = metrics.fcp < 1000 ? '🟢' : metrics.fcp < 2500 ? '🟡' : '🔴';
      console.log(`${fcpColor} FCP: ${Math.round(metrics.fcp)}ms`);
    }
    
    if (metrics.lcp) {
      const lcpColor = metrics.lcp < 2500 ? '🟢' : metrics.lcp < 4000 ? '🟡' : '🔴';
      console.log(`${lcpColor} LCP: ${Math.round(metrics.lcp)}ms`);
    }
    
    if (metrics.domInteractive) {
      console.log(`🔄 DOM Interactive: ${Math.round(metrics.domInteractive)}ms`);
    }
    
    if (metrics.loadTime) {
      console.log(`✅ Load Complete: ${Math.round(metrics.loadTime)}ms`);
    }
    
    console.groupEnd();
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
