/**
 * Formulario para crear/editar usuarios
 * Incluye validación y manejo de estados
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useUserContext } from '../context/UserContext';
import { useRoleContext } from '../context/RoleContext';
import { User, UserFormData, CreateUserRequest, UpdateUserRequest } from '../types/user.types';
import { validateUserForm, sanitizeUserData, getFieldError } from '../utils/validation.utils';
import { hasPermission } from '../utils/permissions.utils';
import { PermissionGuard } from '../../../shared/components/guards/PermissionGuard';

interface UserFormProps {
  user?: User | null; // Si se pasa, es edición. Si no, es creación
  currentUser?: User | null; // Usuario actual para permisos
  onSubmit?: (user: User) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user = null,
  currentUser = null,
  onSubmit,
  onCancel,
  isModal = false
}) => {
  const { getToken } = useAuth();
  const { createUser, updateUser, state: userState } = useUserContext();
  const { loadRoles, state: roleState } = useRoleContext();

  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role_name: 'user',
    is_active: true
  });

  const [errors, setErrors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;

  // Cargar roles al montar el componente
  useEffect(() => {
    if (roleState.roles.length === 0 && !roleState.operations.list.loading) {
      loadRoles(getToken);
    }
  }, []);

  // Forzar recarga de roles cuando se abre el modal de edición si no hay roles
  useEffect(() => {
    if (isEditing && user && roleState.roles.length === 0) {
      loadRoles(getToken);
    }
  }, [isEditing, user, roleState.roles.length, loadRoles, getToken]);

  // Asegurar que siempre tengamos roles disponibles y forzar recarga cuando se abre el componente
  useEffect(() => {
    if (roleState.roles.length === 0 && !roleState.operations.list.loading && !roleState.operations.list.error) {
      loadRoles(getToken);
    }
  }, [roleState.roles.length, roleState.operations.list.loading, roleState.operations.list.error, loadRoles, getToken]);

  // Forzar recarga inicial para obtener todos los roles incluyendo los nuevos
  useEffect(() => {
    if (user || !user) { // Siempre forzar recarga
      loadRoles(getToken);
    }
  }, [loadRoles, getToken]);

  // Inicializar formulario con datos del usuario si es edición
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        phone_number: user.phone_number || '',
        role_name: user.role?.name || 'user',
        is_active: user.is_active
      });
    }
  }, [user]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar errores del campo
    if (errors.length > 0) {
      setErrors(prev => prev.filter(error => error.field !== name));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos
    const validation = validateUserForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const sanitizedData = sanitizeUserData(formData);
      let result: User | null = null;

      if (isEditing && user) {
        // Actualizar usuario existente
        const updateData: UpdateUserRequest = {
          first_name: sanitizedData.first_name,
          last_name: sanitizedData.last_name,
          phone_number: sanitizedData.phone_number,
          role_name: sanitizedData.role_name,
          is_active: sanitizedData.is_active
        };
        result = await updateUser(getToken, user.id, updateData);
      } else {
        // Crear nuevo usuario
        const createData: CreateUserRequest = {
          clerk_id: '', // Se generará en el backend
          email: sanitizedData.email,
          first_name: sanitizedData.first_name,
          last_name: sanitizedData.last_name,
          full_name: `${sanitizedData.first_name} ${sanitizedData.last_name}`,
          phone_number: sanitizedData.phone_number,
          role_name: sanitizedData.role_name
        };
        result = await createUser(getToken, createData);
      }

      if (result) {
        onSubmit?.(result);
        if (!isModal) {
          // Reset form if not in modal
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            role_name: 'user',
            is_active: true
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors([{ field: 'general', message: 'Error al guardar el usuario' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formClasses = isModal 
    ? "space-y-4" 
    : "bg-white rounded-lg shadow p-6 space-y-4";

  // Determinar si necesitamos cargar roles
  const needsRoleRefresh = roleState.roles.length === 0 && !roleState.operations.list.loading;

  return (
    <div className={formClasses}>
      {!isModal && (
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEditing 
              ? 'Modifica la información del usuario seleccionado'
              : 'Completa los datos para crear un nuevo usuario'
            }
          </p>
        </div>
      )}

      {/* Errores generales */}
      {getFieldError(errors, 'general') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {getFieldError(errors, 'general')}
          </p>
        </div>
      )}

      {/* Errores de operación */}
      {(userState.operations.create.error || userState.operations.update.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {userState.operations.create.error || userState.operations.update.error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError(errors, 'first_name') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa el nombre"
            />
            {getFieldError(errors, 'first_name') && (
              <p className="text-red-600 text-xs mt-1">{getFieldError(errors, 'first_name')}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError(errors, 'last_name') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa el apellido"
            />
            {getFieldError(errors, 'last_name') && (
              <p className="text-red-600 text-xs mt-1">{getFieldError(errors, 'last_name')}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isEditing} // No se puede cambiar email en edición
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError(errors, 'email') ? 'border-red-500' : 'border-gray-300'
            } ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="correo@ejemplo.com"
          />
          {getFieldError(errors, 'email') && (
            <p className="text-red-600 text-xs mt-1">{getFieldError(errors, 'email')}</p>
          )}
          {isEditing && (
            <p className="text-gray-500 text-xs mt-1">El email no se puede modificar</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError(errors, 'phone_number') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+1234567890"
          />
          {getFieldError(errors, 'phone_number') && (
            <p className="text-red-600 text-xs mt-1">{getFieldError(errors, 'phone_number')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rol */}
          <div>
            <label htmlFor="role_name" className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <PermissionGuard user={currentUser} permission="roles.assign">
              <select
                id="role_name"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError(errors, 'role_name') ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {/* Opción de fallback si no hay rol seleccionado */}
                {!formData.role_name && (
                  <option value="">Selecciona un rol</option>
                )}

                {roleState.roles.length > 0 ? (
                  roleState.roles
                    .filter(role => role.is_active)
                    .map(role => (
                      <option key={role.id} value={role.name}>
                        {role.display_name}
                      </option>
                    ))
                ) : (
                  <option value="user">Usuario (cargando roles...)</option>
                )}
              </select>
              {/* Información de estado de carga */}
              {roleState.operations.list.loading && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                  Cargando roles...
                </p>
              )}
              {roleState.operations.list.error && (
                <p className="text-xs text-red-600 mt-1">
                  Error cargando roles: {roleState.operations.list.error}
                </p>
              )}
              {needsRoleRefresh && (
                <button
                  type="button"
                  onClick={() => loadRoles(getToken)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Recargar roles
                </button>
              )}
            </PermissionGuard>
            
            {/* Mostrar solo rol actual si no tiene permisos */}
            {!currentUser || !hasPermission(currentUser, 'roles.assign') ? (
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                {roleState.roles.find(r => r.name === formData.role_name)?.display_name || 'Usuario'}
                <p className="text-xs text-gray-500 mt-1">No tienes permisos para cambiar roles</p>
              </div>
            ) : null}
            
            {getFieldError(errors, 'role_name') && (
              <p className="text-red-600 text-xs mt-1">{getFieldError(errors, 'role_name')}</p>
            )}
          </div>

          {/* Estado */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Usuario activo
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          
          <PermissionGuard 
            user={null} 
            permission={isEditing ? "users.update" : "users.create"}
          >
            <button
              type="submit"
              disabled={isSubmitting || (isEditing && userState.operations.update.loading) || (!isEditing && userState.operations.create.loading)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {(isSubmitting || (isEditing && userState.operations.update.loading) || (!isEditing && userState.operations.create.loading)) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </PermissionGuard>
        </div>
      </form>
    </div>
  );
};