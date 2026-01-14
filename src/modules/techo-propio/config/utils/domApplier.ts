/**
 * Utilidades para aplicar la configuración visual al DOM
 * Usa CSS Variables con prefijo --tp- para evitar conflictos
 */

import { TechoPropioConfig } from '../types/config.types';

/**
 * Aplica la configuración al DOM usando CSS Variables
 * Las variables se aplican al root del documento con prefijo --tp-
 *
 * @param config - Configuración a aplicar
 */
export function applyConfigToDOM(config: TechoPropioConfig): void {
  try {
    const root = document.documentElement;

    // Aplicar colores como CSS Variables
    root.style.setProperty('--tp-primary', config.colors.primary);
    root.style.setProperty('--tp-secondary', config.colors.secondary);
    root.style.setProperty('--tp-accent', config.colors.accent);

    // Aplicar gradiente (primario → secundario)
    const gradient = `linear-gradient(to right, ${config.colors.primary}, ${config.colors.secondary})`;
    root.style.setProperty('--tp-gradient', gradient);

    // Guardar también en data attributes para acceso directo
    root.setAttribute('data-tp-primary', config.colors.primary);
    root.setAttribute('data-tp-secondary', config.colors.secondary);
    root.setAttribute('data-tp-accent', config.colors.accent);
    root.setAttribute('data-tp-sidebar-icon', config.logos.sidebar_icon);
    root.setAttribute('data-tp-module-title', config.branding.module_title);
  } catch (error) {
    console.error('❌ Error aplicando configuración al DOM:', error);
  }
}

/**
 * Remueve la configuración del DOM
 * Limpia todas las CSS Variables con prefijo --tp-
 */
export function removeConfigFromDOM(): void {
  try {
    const root = document.documentElement;

    // Remover CSS Variables
    root.style.removeProperty('--tp-primary');
    root.style.removeProperty('--tp-secondary');
    root.style.removeProperty('--tp-accent');
    root.style.removeProperty('--tp-gradient');

    // Remover data attributes
    root.removeAttribute('data-tp-primary');
    root.removeAttribute('data-tp-secondary');
    root.removeAttribute('data-tp-accent');
    root.removeAttribute('data-tp-sidebar-icon');
    root.removeAttribute('data-tp-module-title');
  } catch (error) {
    console.error('❌ Error removiendo configuración del DOM:', error);
  }
}

/**
 * Obtiene el valor de una CSS Variable del DOM
 *
 * @param variable - Nombre de la variable (sin --)
 * @returns Valor de la variable o null si no existe
 */
export function getConfigFromDOM(variable: string): string | null {
  try {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(`--tp-${variable}`).trim();
    return value || null;
  } catch (error) {
    console.error(`❌ Error obteniendo variable --tp-${variable}:`, error);
    return null;
  }
}

/**
 * Verifica si existe configuración aplicada en el DOM
 *
 * @returns true si hay configuración aplicada, false si no
 */
export function hasConfigInDOM(): boolean {
  const primary = getConfigFromDOM('primary');
  return primary !== null && primary !== '';
}
