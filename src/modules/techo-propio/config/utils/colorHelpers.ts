/**
 * Utilidades para trabajar con colores personalizados del módulo Techo Propio
 * Facilita el uso de CSS Variables en componentes
 */

/**
 * Obtiene el valor de un color personalizado del DOM
 * @param colorKey - 'primary', 'secondary', o 'accent'
 * @returns El valor hexadecimal del color o el color por defecto
 */
export function getTPColor(colorKey: 'primary' | 'secondary' | 'accent'): string {
  if (typeof window === 'undefined') return '#16a34a'; // SSR fallback

  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(`--tp-${colorKey}`).trim();

  // Valores por defecto si no están definidos
  const defaults = {
    primary: '#16a34a',
    secondary: '#2563eb',
    accent: '#dc2626'
  };

  return value || defaults[colorKey];
}

/**
 * Genera un objeto de estilo con el gradiente personalizado
 * @param direction - Dirección del gradiente ('to right', 'to bottom', etc.)
 * @returns Objeto React CSSProperties
 */
export function getTPGradient(direction: string = 'to right'): React.CSSProperties {
  return {
    background: `linear-gradient(${direction}, var(--tp-primary, #16a34a), var(--tp-secondary, #2563eb))`
  };
}

/**
 * Genera un objeto de estilo con color de fondo personalizado
 * @param colorKey - 'primary', 'secondary', o 'accent'
 * @param opacity - Opacidad del color (0-1)
 * @returns Objeto React CSSProperties
 */
export function getTPBackground(colorKey: 'primary' | 'secondary' | 'accent', opacity: number = 1): React.CSSProperties {
  if (opacity < 1) {
    const color = getTPColor(colorKey);
    return {
      backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
    };
  }

  return {
    backgroundColor: `var(--tp-${colorKey}, ${getTPColor(colorKey)})`
  };
}

/**
 * Genera un objeto de estilo con color de texto personalizado
 * @param colorKey - 'primary', 'secondary', o 'accent'
 * @returns Objeto React CSSProperties
 */
export function getTPTextColor(colorKey: 'primary' | 'secondary' | 'accent'): React.CSSProperties {
  return {
    color: `var(--tp-${colorKey}, ${getTPColor(colorKey)})`
  };
}

/**
 * Clases de Tailwind CSS personalizadas que usan las variables CSS
 * Útil para mantener la sintaxis de Tailwind pero con colores personalizados
 */
export const tpStyles = {
  // Botones
  btnPrimary: (isActive: boolean = false) => ({
    style: isActive ? getTPGradient('to right') : {},
    className: isActive
      ? 'text-white shadow-md hover:shadow-lg transition-all'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }),

  // Badges
  badgeSuccess: () => ({
    style: {
      backgroundColor: 'var(--tp-primary, #16a34a)',
      color: 'white',
      opacity: 0.9
    },
    className: 'px-2 py-1 rounded-full text-xs font-medium'
  }),

  // Cards con borde
  cardBorder: () => ({
    style: { borderLeftColor: 'var(--tp-primary, #16a34a)' },
    className: 'border-l-4'
  }),

  // Links/Texto hover
  linkHover: () => ({
    style: {},
    className: 'hover:opacity-80 transition-colors'
  })
};
