// Servicio para manejar la autenticación y roles con la API del backend

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
      console.log('🔍 getCurrentUser: Obteniendo token...');
      const token = await getToken();
      console.log('🔑 Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const headers = await this.getAuthHeaders(getToken);
      console.log('📡 Haciendo llamada a:', `${API_BASE_URL}/auth/me`);
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers
      });
      
      console.log('📊 Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error obteniendo perfil de usuario: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log('✅ Usuario obtenido:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Error en getCurrentUser:', error);
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

  async updateUserRole(getToken: () => Promise<string | null>, clerkId: string, roleName: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const response = await fetch(`${API_BASE_URL}/auth/users/${clerkId}/role?role_name=${roleName}`, {
        method: 'PUT',
        headers
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error en updateUserRole:', error);
      return false;
    }
  }

  // Método para sincronizar usuario automáticamente cuando se autentica
  async syncUserWithBackend(getToken: () => Promise<string | null>): Promise<UserProfile | null> {
    try {
      console.log('🔄 Iniciando sincronización con backend...');
      // Este método llama a /auth/me que automáticamente sincroniza el usuario si no existe
      const user = await this.getCurrentUser(getToken);
      if (user) {
        console.log('✅ Usuario sincronizado correctamente:', user.full_name);
      } else {
        console.log('❌ No se pudo sincronizar el usuario');
      }
      return user;
    } catch (error) {
      console.error('❌ Error sincronizando usuario:', error);
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
      console.log('🔧 Debug: Enviando datos al backend:', userData);
      
      const response = await fetch(`${API_BASE_URL}/debug/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      console.log('🔧 Debug: Respuesta del backend:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error en debugCreateUser:', error);
      return { success: false, message: `Error: ${error}` };
    }
  }
}

export const authService = new AuthService();