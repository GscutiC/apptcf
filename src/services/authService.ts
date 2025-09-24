// Servicio para manejar la autenticación y roles con la API del backend

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  async getAuthHeaders(getToken: () => Promise<string | null>): Promise<HeadersInit> {
    const token = await getToken();
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getCurrentUser(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Error obteniendo perfil de usuario');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
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
      
      return await response.json();
    } catch (error) {
      console.error('Error en getAllRoles:', error);
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
      console.error('Error en getAllUsers:', error);
      return [];
    }
  }

  async updateUserRole(getToken: () => Promise<string | null>, userId: string, roleId: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role_id: roleId })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error en updateUserRole:', error);
      return false;
    }
  }

  // Método para verificar permisos
  hasPermission(user: UserProfile, permission: string): boolean {
    return user.role?.permissions.includes(permission) || false;
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
}

export const authService = new AuthService();