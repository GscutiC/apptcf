/**
 * Cache Service - SOLO para datos ESTÁTICOS (UBIGEO)
 * NO usar para datos de personas (RENIEC, DNI, etc.)
 *
 * USO CORRECTO:
 * - Departamentos, provincias, distritos (datos geográficos estáticos)
 *
 * USO INCORRECTO (NO HACER):
 * - Validaciones de DNI con RENIEC
 * - Datos personales de usuarios
 * - Información que cambia frecuentemente
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  // TTLs específicos por tipo de dato
  private readonly TTL_UBIGEO = 1000 * 60 * 60 * 24; // 24 horas (datos geográficos no cambian)

  /**
   * Guardar datos en cache con TTL específico
   * @param key Identificador único del cache
   * @param data Datos a cachear
   * @param ttl Tiempo de vida en milisegundos (opcional)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiryTime = ttl || this.TTL_UBIGEO;

    this.cache.set(key, {
      data,
      expiry: Date.now() + expiryTime
    });

    console.debug(`[Cache] SET: ${key} (TTL: ${expiryTime / 1000}s)`);
  }

  /**
   * Obtener datos del cache si están vigentes
   * @param key Identificador del cache
   * @returns Datos cacheados o null si no existe o expiró
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      console.debug(`[Cache] MISS: ${key}`);
      return null;
    }

    // Verificar si expiró
    if (Date.now() > item.expiry) {
      console.debug(`[Cache] EXPIRED: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.debug(`[Cache] HIT: ${key}`);
    return item.data as T;
  }

  /**
   * Verificar si existe un item en cache y está vigente
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Eliminar un item específico del cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.debug(`[Cache] DELETE: ${key}`);
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    this.cache.clear();
    console.debug('[Cache] CLEARED ALL');
  }

  /**
   * Limpiar items expirados (mantener cache limpio)
   */
  cleanExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // ✅ FIX: Usar Array.from() para compatibilidad con TypeScript
    const entries = Array.from(this.cache.entries());

    for (const [key, item] of entries) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.debug(`[Cache] Cleaned ${cleanedCount} expired items`);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats(): { total: number; expired: number; active: number } {
    const now = Date.now();
    let expired = 0;

    // ✅ FIX: Usar Array.from() para compatibilidad con TypeScript
    const values = Array.from(this.cache.values());

    for (const item of values) {
      if (now > item.expiry) {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      expired,
      active: this.cache.size - expired
    };
  }
}

// Exportar singleton
export const cacheService = new CacheService();

// Limpiar items expirados cada 1 hora
setInterval(() => {
  cacheService.cleanExpired();
}, 1000 * 60 * 60);

// Exportar constantes para keys
export const CACHE_KEYS = {
  DEPARTMENTS: 'ubigeo_departments',
  PROVINCES: (deptCode: string) => `ubigeo_provinces_${deptCode}`,
  DISTRICTS: (deptCode: string, provCode: string) => `ubigeo_districts_${deptCode}_${provCode}`
} as const;
