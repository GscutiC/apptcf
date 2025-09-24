/**
 * Servicio para gestión de usuarios
 * Se integra con el backend de autorización ya implementado
 */

import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UsersResponse, 
  UserListFilters,
  PaginationInfo
} from '../types/user.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class UserService {
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
   * Obtener todos los usuarios con filtros y paginación
   */
  async getUsers(
    getToken: () => Promise<string | null>,
    filters?: UserListFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<UsersResponse> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString()
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.role && filters.role !== 'all') {
        params.append('role', filters.role);
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.sortBy) {
        params.append('sort_by', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sort_order', filters.sortOrder);
      }

      const response = await fetch(`${API_BASE_URL}/auth/users?${params}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const users = await response.json();
      
      // El backend actualmente no devuelve paginación, así que la simulamos
      const total = users.length;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error(`Error obteniendo usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(
    getToken: () => Promise<string | null>,
    userId: string
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw new Error(`Error obteniendo usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(
    getToken: () => Promise<string | null>,
    userData: CreateUserRequest
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error(`Error creando usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar un usuario existente
   */
  async updateUser(
    getToken: () => Promise<string | null>,
    userId: string,
    userData: UpdateUserRequest
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw new Error(`Error actualizando usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(
    getToken: () => Promise<string | null>,
    userId: string
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw new Error(`Error eliminando usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar rol de un usuario
   */
  async updateUserRole(
    getToken: () => Promise<string | null>,
    clerkId: string,
    roleName: string
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/users/${clerkId}/role?role_name=${roleName}`, {
        method: 'PUT',
        headers
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
   * Obtener perfil del usuario actual
   */
  async getCurrentUser(
    getToken: () => Promise<string | null>
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo perfil actual:', error);
      throw new Error(`Error obteniendo perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateCurrentUser(
    getToken: () => Promise<string | null>,
    userData: UpdateUserRequest
  ): Promise<User> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw new Error(`Error actualizando perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Buscar usuarios por término de búsqueda
   */
  async searchUsers(
    getToken: () => Promise<string | null>,
    searchTerm: string,
    limit: number = 10
  ): Promise<User[]> {
    try {
      const users = await this.getUsers(getToken, { search: searchTerm }, 1, limit);
      return users.users;
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(
    getToken: () => Promise<string | null>
  ): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [role: string]: number };
  }> {
    try {
      const users = await this.getUsers(getToken, {}, 1, 1000); // Obtener todos
      
      const stats = {
        total: users.users.length,
        active: users.users.filter(u => u.is_active).length,
        inactive: users.users.filter(u => !u.is_active).length,
        byRole: {} as { [role: string]: number }
      };

      // Contar por roles
      users.users.forEach(user => {
        const roleName = user.role?.name || 'sin_rol';
        stats.byRole[roleName] = (stats.byRole[roleName] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService();