/**
 * Servicio para gestión de roles
 * Se integra con el backend de autorización ya implementado
 */

import { 
  UserRole, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  Permission
} from '../types/user.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class RoleService {
  /**
   * Obtener headers de autenticación
   */
  private async getAuthHeaders(getToken: () => Promise<string | null>): Promise<HeadersInit> {
    const token = await getToken();
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Obtener todos los roles
   */
  async getRoles(
    getToken: () => Promise<string | null>
  ): Promise<UserRole[]> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/roles`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw new Error(`Error obteniendo roles: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener un rol por ID
   */
  async getRoleById(
    getToken: () => Promise<string | null>,
    roleId: string
  ): Promise<UserRole> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/roles/${roleId}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Rol no encontrado'); 
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      throw new Error(`Error obteniendo rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crear un nuevo rol
   */
  async createRole(
    getToken: () => Promise<string | null>,
    roleData: CreateRoleRequest
  ): Promise<UserRole> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando rol:', error);
      throw new Error(`Error creando rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar un rol existente
   */
  async updateRole(
    getToken: () => Promise<string | null>,
    roleId: string,
    roleData: UpdateRoleRequest
  ): Promise<UserRole> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/roles/${roleId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando rol:', error);
      throw new Error(`Error actualizando rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar un rol
   */
  async deleteRole(
    getToken: () => Promise<string | null>,
    roleId: string
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/roles/${roleId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Rol no encontrado');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
      throw new Error(`Error eliminando rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener todos los permisos disponibles
   */
  getAvailablePermissions(): Permission[] {
    return [
      // Users permissions
      'users.create',
      'users.read', 
      'users.update',
      'users.delete',
      'users.list',
      'users.assign_role',
      // Roles permissions  
      'roles.create',
      'roles.read',
      'roles.update', 
      'roles.delete',
      'roles.list',
      'roles.assign',
      // Messages permissions
      'messages.create',
      'messages.read',
      'messages.update',
      'messages.delete',
      // AI permissions
      'ai.process_message',
      'ai.access_advanced',
      // Admin permissions
      'admin.dashboard',
      'admin.system_settings',
      // System permissions
      'system.read',
      'system.maintenance',
      // Audit permissions
      'audit.view_logs'
    ];
  }

  /**
   * Obtener roles activos únicamente
   */
  async getActiveRoles(
    getToken: () => Promise<string | null>
  ): Promise<UserRole[]> {
    try {
      const allRoles = await this.getRoles(getToken);
      return allRoles.filter(role => role.is_active);
    } catch (error) {
      console.error('Error obteniendo roles activos:', error);
      throw error;
    }
  }

  /**
   * Buscar roles por nombre
   */
  async searchRoles(
    getToken: () => Promise<string | null>,
    searchTerm: string
  ): Promise<UserRole[]> {
    try {
      const allRoles = await this.getRoles(getToken);
      const searchLower = searchTerm.toLowerCase();
      
      return allRoles.filter(role => 
        role.name.toLowerCase().includes(searchLower) ||
        role.display_name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error buscando roles:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  async getRoleStats(
    getToken: () => Promise<string | null>
  ): Promise<{
    total: number;
    active: number;
    inactive: number;
    permissionUsage: { [permission: string]: number };
  }> {
    try {
      const roles = await this.getRoles(getToken);
      
      const stats = {
        total: roles.length,
        active: roles.filter(r => r.is_active).length,
        inactive: roles.filter(r => !r.is_active).length,
        permissionUsage: {} as { [permission: string]: number }
      };

      // Contar uso de permisos
      roles.forEach(role => {
        role.permissions.forEach(permission => {
          stats.permissionUsage[permission] = (stats.permissionUsage[permission] || 0) + 1;
        });
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de roles:', error);
      throw error;
    }
  }

  /**
   * Verificar si un rol puede ser eliminado
   */
  async canDeleteRole(
    getToken: () => Promise<string | null>,
    roleId: string
  ): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      // Los roles predeterminados no se pueden eliminar
      const role = await this.getRoleById(getToken, roleId);
      const systemRoles = ['user', 'moderator', 'admin', 'super_admin'];
      
      if (systemRoles.includes(role.name)) {
        return {
          canDelete: false,
          reason: 'Los roles del sistema no pueden ser eliminados'
        };
      }

      // TODO: Verificar si hay usuarios asignados a este rol
      // Esto requeriría una nueva consulta al backend

      return { canDelete: true };
    } catch (error) {
      console.error('Error verificando si el rol puede ser eliminado:', error);
      return {
        canDelete: false,
        reason: 'Error verificando dependencias del rol'
      };
    }
  }

  /**
   * Clonar un rol existente
   */
  async cloneRole(
    getToken: () => Promise<string | null>,
    roleId: string,
    newName: string,
    newDisplayName: string
  ): Promise<UserRole> {
    try {
      const originalRole = await this.getRoleById(getToken, roleId);
      
      const cloneData: CreateRoleRequest = {
        name: newName,
        display_name: newDisplayName,
        description: `Copia de ${originalRole.display_name}`,
        permissions: [...originalRole.permissions]
      };

      return await this.createRole(getToken, cloneData);
    } catch (error) {
      console.error('Error clonando rol:', error);
      throw new Error(`Error clonando rol: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Instancia singleton del servicio
export const roleService = new RoleService();