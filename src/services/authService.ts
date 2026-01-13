// Servicio para manejar la autenticación y roles con la API del backend

import { logger } from '../shared/utils/logger';

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string;
  phone_number?: string;
  role?: {
    id: string;
    name: string;
    display_name: string;
    description?: string;
    permissions: string[];
    is_active: boolean;
  };
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Sistema de caché en memoria para evitar peticiones duplicadas
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class AuthService {
  // Caché en memoria para userProfile
  private userProfileCache: CacheEntry<UserProfile> | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Control de peticiones pendientes (evita múltiples peticiones simultáneas)
  private pendingUserProfileRequest: PendingRequest<UserProfile | null> | null = null;
  private readonly PENDING_REQUEST_TIMEOUT = 10000; // 10 segundos
  /**
   * Invalida el caché de userProfile
   * Útil cuando se actualiza el perfil del usuario
   */
  clearUserProfileCache(): void {
    this.userProfileCache = null;
    this.pendingUserProfileRequest = null;
    logger.info('🗑️ Caché de userProfile limpiado');
  }

  /**
   * Obtiene userProfile desde caché si está disponible y no expiró
   */
  private getUserProfileFromCache(): UserProfile | null {
    if (!this.userProfileCache) {
      return null;
    }

    const now = Date.now();
    if (now > this.userProfileCache.expiresAt) {
      logger.info('⏰ Caché de userProfile expirado');
      this.userProfileCache = null;
      return null;
    }

    logger.info('⚡ UserProfile obtenido desde caché');
    return this.userProfileCache.data;
  }

  /**
   * Guarda userProfile en caché
   */
  private setUserProfileCache(profile: UserProfile): void {
    const now = Date.now();
    this.userProfileCache = {
      data: profile,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    logger.info(`💾 UserProfile guardado en caché (expira en ${this.CACHE_DURATION / 1000}s)`);
  }

  /**
   * Limpia peticiones pendientes expiradas
   */
  private cleanExpiredPendingRequests(): void {
    if (this.pendingUserProfileRequest) {
      const now = Date.now();
      if (now - this.pendingUserProfileRequest.timestamp > this.PENDING_REQUEST_TIMEOUT) {
        logger.warn('🧹 Petición pendiente expirada, limpiando...');
        this.pendingUserProfileRequest = null;
      }
    }
  }

  async getAuthHeaders(getToken: () => Promise<string | null>): Promise<HeadersInit> {
    const token = await getToken();

    if (!token) {
      logger.error('❌ No se pudo obtener token de autenticación');
    }

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Obtiene el perfil del usuario actual con caché inteligente
   * - Primero verifica caché en memoria
   * - Si hay petición pendiente, espera a que termine
   * - Solo hace fetch si no hay caché válido
   */
  async getCurrentUser(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      // PASO 1: Verificar caché
      const cachedProfile = this.getUserProfileFromCache();
      if (cachedProfile) {
        return cachedProfile;
      }

      // PASO 2: Limpiar peticiones expiradas
      this.cleanExpiredPendingRequests();

      // PASO 3: Si hay petición pendiente, esperar a que termine
      if (this.pendingUserProfileRequest) {
        logger.info('⏳ Esperando petición pendiente de userProfile...');
        return await this.pendingUserProfileRequest.promise;
      }

      // PASO 4: Crear nueva petición
      logger.info('🌐 Fetching userProfile desde backend...');
      const requestPromise = this.fetchUserProfileFromBackend(getToken);

      this.pendingUserProfileRequest = {
        promise: requestPromise,
        timestamp: Date.now()
      };

      const userData = await requestPromise;

      // Limpiar petición pendiente
      this.pendingUserProfileRequest = null;

      // Guardar en caché si es válido
      if (userData) {
        this.setUserProfileCache(userData);
      }

      return userData;
    } catch (error) {
      logger.error('Error en getCurrentUser:', error);
      this.pendingUserProfileRequest = null;
      return null;
    }
  }

  /**
   * Método interno para hacer fetch del userProfile desde el backend
   */
  private async fetchUserProfileFromBackend(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      const headers = await this.getAuthHeaders(getToken);

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`❌ Error del servidor al obtener perfil (${response.status}):`, errorText);
        throw new Error(`Error obteniendo perfil de usuario: ${response.status} - ${errorText}`);
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      logger.error('❌ Error en fetchUserProfileFromBackend:', error);
      if (error instanceof Error) {
        logger.error('   └─ Message:', error.message);
      }
      return null;
    }
  }

  async getAllRoles(getToken: () => Promise<string | null>): Promise<UserRole[]> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/auth/roles`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Error obteniendo roles');
      }

      const roles = await response.json();
      return roles;
    } catch (error) {
      logger.error('Error en getAllRoles:', error);
      return [];
    }
  }

  async getAllUsers(getToken: () => Promise<string | null>): Promise<UserProfile[]> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Error obteniendo usuarios');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error en getAllUsers:', error);
      return [];
    }
  }

  async updateUserRole(getToken: () => Promise<string | null>, clerkId: string, roleName: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const url = `${API_BASE_URL}/auth/users/${clerkId}/role?role_name=${roleName}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Error response:', response.status, errorText);
      }

      return response.ok;
    } catch (error) {
      logger.error('Error en updateUserRole:', error);
      return false;
    }
  }

  async createRole(getToken: () => Promise<string | null>, roleData: { name: string; display_name: string; description: string; permissions: string[] }): Promise<UserRole | null> {
    try {
      const headers = await this.getAuthHeaders(getToken);

      const response = await fetch(`${API_BASE_URL}/auth/roles/create`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Error creating role:', response.status, errorText);
        throw new Error(`Error creating role: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error en createRole:', error);
      throw error;
    }
  }

  async updateRole(getToken: () => Promise<string | null>, roleId: string, roleData: { display_name?: string; description?: string; permissions?: string[] }): Promise<UserRole | null> {
    try {
      const headers = await this.getAuthHeaders(getToken);

      const response = await fetch(`${API_BASE_URL}/auth/roles/${roleId}/update`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Error updating role:', response.status, errorText);
        throw new Error(`Error updating role: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error en updateRole:', error);
      throw error;
    }
  }

  /**
   * Sincroniza usuario con backend (usa caché automáticamente)
   * Este método llama a /auth/me que automáticamente sincroniza el usuario si no existe
   */
  async syncUserWithBackend(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser(getToken);
      return user;
    } catch (error) {
      logger.error('Error sincronizando usuario:', error);
      return null;
    }
  }

  /**
   * Refresca el perfil del usuario desde el backend (ignora caché)
   * Útil cuando sabes que el perfil cambió
   */
  async refreshUserProfile(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      logger.info('🔄 Refrescando userProfile (ignorando caché)...');
      this.clearUserProfileCache();
      const user = await this.getCurrentUser(getToken);
      return user;
    } catch (error) {
      logger.error('Error refrescando usuario:', error);
      return null;
    }
  }

  // Método para verificar permisos
  hasPermission(user: UserProfile, permission: string): boolean {
    return user.role?.permissions.includes(permission) || 
           user.role?.permissions.includes('all') || false;
  }

  // Método para verificar si es super admin
  isSuperAdmin(user: UserProfile): boolean {
    return user.role?.name === 'super_admin';
  }

  // Método para verificar si es admin
  isAdmin(user: UserProfile): boolean {
    const role = user.role?.name;
    return role === 'super_admin' || role === 'admin';
  }

  // Método para verificar si es usuario estándar
  isUser(user: UserProfile): boolean {
    return user.role?.name === 'user';
  }

  // Método para obtener el nombre del rol
  getRoleName(user: UserProfile): string {
    return user.role?.display_name || user.role?.name || 'Sin rol';
  }

  // Método de debug para crear usuario directamente
  async debugCreateUser(userData: {
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    image_url?: string;
    phone_number?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/debug/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error en debugCreateUser:', error);
      return { success: false, message: `Error: ${error}` };
    }
  }
}

export const authService = new AuthService();