import React, { useState, useEffect } from 'react';
import { PERMISSION_GROUPS, getRoleColor } from '../../../modules/user-management/utils/permissions.utils';
import { RoleName } from '../../../modules/user-management/types/user.types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: RoleFormData) => Promise<void>;
  role?: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    is_system_role?: boolean; // ✅ Agregar propiedad del sistema
  } | null;
  mode: 'create' | 'edit';
}

export interface RoleFormData {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role,
  mode
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role && mode === 'edit') {
      setFormData({
        name: role.name,
        display_name: getRoleDisplayName(role.name as RoleName),
        description: role.description || '',
        permissions: role.permissions
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permissions: []
      });
    }
    setErrors({});
  }, [role, mode, isOpen]);

  const getRoleDisplayName = (roleName: string): string => {
    const displayNames: Record<string, string> = {
      'user': 'Usuario',
      'moderator': 'Moderador',  
      'admin': 'Administrador',
      'super_admin': 'Super Administrador'
    };
    return displayNames[roleName] || roleName;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const isSystemRole = role?.is_system_role || (role && ['user', 'moderator', 'admin', 'super_admin'].includes(role.name));

    // Para roles del sistema en modo edición, solo validar permisos
    if (mode === 'edit' && isSystemRole) {
      if (formData.permissions.length === 0) {
        newErrors.permissions = 'Debe seleccionar al menos un permiso';
      }
    } else {
      // Validación completa para roles nuevos o no del sistema
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre del rol es requerido';
      } else if (!/^[a-z_]+$/.test(formData.name)) {
        newErrors.name = 'El nombre debe contener solo letras minúsculas y guiones bajos';
      }

      if (!formData.display_name.trim()) {
        newErrors.display_name = 'El nombre para mostrar es requerido';
      }

      if (formData.permissions.length === 0) {
        newErrors.permissions = 'Debe seleccionar al menos un permiso';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ MEJORA: Lógica inteligente para roles del sistema
      const isSystemRole = role?.is_system_role || (role && ['user', 'moderator', 'admin', 'super_admin'].includes(role.name));
      
      let dataToSave = formData;
      
      if (mode === 'edit' && isSystemRole) {
        // Para roles del sistema, solo enviar los permisos que cambiaron
        const originalPermissions = role?.permissions || [];
        const newPermissions = formData.permissions;
        
        // Verificar si realmente cambiaron los permisos
        const permissionsChanged = originalPermissions.length !== newPermissions.length ||
          originalPermissions.some(p => !newPermissions.includes(p)) ||
          newPermissions.some(p => !originalPermissions.includes(p));
        
        if (!permissionsChanged) {
          onClose();
          return;
        }
        
        // Solo enviar permisos para evitar error del backend
        dataToSave = {
          name: role.name,
          display_name: getRoleDisplayName(role.name as RoleName),
          description: role.description || '',
          permissions: formData.permissions
        };
      } else {
        // Para roles nuevos o personalizados, enviar todos los datos
        dataToSave = formData;
      }
      
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error guardando rol:', error);
      setErrors({ submit: 'Error al guardar el rol. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSelectAllCategory = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPermissions.includes(p))
        : Array.from(new Set([...prev.permissions, ...categoryPermissions]))
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? '➕ Crear Nuevo Rol' : '✏️ Editar Rol'}
              </h2>
              {/* ✅ Indicador para roles del sistema */}
              {mode === 'edit' && role && (role.is_system_role || ['user', 'moderator', 'admin', 'super_admin'].includes(role.name)) && (
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🛡️ Rol del Sistema
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Solo se pueden modificar permisos
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ✅ Detectar si es rol del sistema */}
          {(() => {
            const isSystemRole = role?.is_system_role || (role && ['user', 'moderator', 'admin', 'super_admin'].includes(role.name));
            const isEditingSystemRole = Boolean(mode === 'edit' && isSystemRole);
            
            return (
              <>
                {/* Información básica del rol */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del rol *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase() }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } ${isEditingSystemRole ? 'bg-gray-100' : ''}`}
                      placeholder="ej: editor, supervisor"
                      disabled={mode === 'edit' || loading}
                      readOnly={isEditingSystemRole}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    {isEditingSystemRole && (
                      <p className="text-xs text-gray-500 mt-1">🔒 Los roles del sistema no pueden cambiar de nombre</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre para mostrar *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.display_name ? 'border-red-500' : 'border-gray-300'
                      } ${isEditingSystemRole ? 'bg-gray-100' : ''}`}
                      placeholder="ej: Editor, Supervisor"
                      disabled={loading || isEditingSystemRole}
                      readOnly={isEditingSystemRole}
                    />
                    {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
                    {isEditingSystemRole && (
                      <p className="text-xs text-gray-500 mt-1">🔒 Los roles del sistema mantienen su nombre original</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditingSystemRole ? 'bg-gray-100' : ''
                    }`}
                    rows={3}
                    placeholder="Descripción del rol y sus responsabilidades..."
                    disabled={loading || isEditingSystemRole}
                    readOnly={isEditingSystemRole}
                  />
                  {isEditingSystemRole && (
                    <p className="text-xs text-gray-500 mt-1">🔒 Los roles del sistema mantienen su descripción original</p>
                  )}
                </div>
              </>
            );
          })()}

          {/* Selección de permisos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Permisos *
              </label>
              <span className="text-sm text-gray-600">
                {formData.permissions.length} permisos seleccionados
              </span>
            </div>
            
            {errors.permissions && <p className="text-red-500 text-sm mb-4">{errors.permissions}</p>}

            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {PERMISSION_GROUPS.map((group) => {
                const categoryPermissions = group.permissions.map(p => p.permission);
                const selectedInCategory = categoryPermissions.filter(p => formData.permissions.includes(p));
                const allSelected = selectedInCategory.length === categoryPermissions.length;
                const someSelected = selectedInCategory.length > 0;

                return (
                  <div key={group.category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{group.category}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {selectedInCategory.length}/{categoryPermissions.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectAllCategory(categoryPermissions)}
                          className={`px-2 py-1 text-xs rounded ${
                            allSelected 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          disabled={loading}
                        >
                          {allSelected ? 'Deseleccionar' : 'Seleccionar'} todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((perm) => {
                        const isSelected = formData.permissions.includes(perm.permission);
                        return (
                          <label
                            key={perm.permission}
                            className={`flex items-start space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePermissionToggle(perm.permission)}
                              className="mt-1 text-blue-600 focus:ring-blue-500"
                              disabled={loading}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {perm.permission}
                              </p>
                              <p className="text-xs text-gray-600">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;