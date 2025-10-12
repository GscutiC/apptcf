/**
 * Hook para cargar CSS de forma progresiva
 * Carga CSS crítico primero, luego el resto
 */

import { useEffect } from 'react';

interface ProgressiveCSSOptions {
  criticalStyles?: string[];
  deferredStyles?: string[];
}

/**
 * Carga CSS de forma progresiva para mejorar el tiempo de renderizado inicial
 * @param options - Opciones de carga de CSS
 */
export const useProgressiveCSS = (options: ProgressiveCSSOptions = {}) => {
  const { criticalStyles = [], deferredStyles = [] } = options;

  useEffect(() => {
    // Cargar estilos diferidos después de que la página esté idle
    if (deferredStyles.length === 0) return;

    const loadDeferredStyles = () => {
      deferredStyles.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print'; // Truquillo: cargar como print para no bloquear
        
        link.onload = () => {
          link.media = 'all'; // Cambiar a all cuando termine de cargar
        };
        
        document.head.appendChild(link);
      });
    };

    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadDeferredStyles);
    } else {
      // Fallback: setTimeout
      setTimeout(loadDeferredStyles, 1);
    }
  }, [deferredStyles]);

  return null;
};

/**
 * Inline critical CSS en el head del documento
 * @param css - CSS crítico como string
 */
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.id = 'critical-css';
  
  // Insertar al inicio del head
  document.head.insertBefore(style, document.head.firstChild);
};

/**
 * CSS crítico para el loading inicial
 * Estilos mínimos para evitar FOUC
 */
export const CRITICAL_CSS = `
  /* Reset básico */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Body */
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f9fafb;
  }
  
  /* Loading screen crítico */
  #root {
    min-height: 100vh;
  }
  
  /* Spinner de carga */
  .loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 0.8s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Utilidades críticas */
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .min-h-screen { min-height: 100vh; }
  .bg-gray-50 { background-color: #f9fafb; }
`;

export default useProgressiveCSS;
