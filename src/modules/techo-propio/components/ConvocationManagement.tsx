import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { convocationService, Convocation, ConvocationCreateRequest } from '../../../services/convocationService';

// Tipos para el formulario
interface ConvocationFormData {
  code: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_published: boolean;
  max_applications: string;
}

interface FormErrors {
  [key: string]: string;
}

const ConvocationManagement: React.FC = () => {
  const { getToken } = useAuth();
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConvocation, setEditingConvocation] = useState<Convocation | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState<ConvocationFormData>({
    code: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    is_published: false,
    max_applications: ''
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Inicializar servicio con token de Clerk
  useEffect(() => {
    convocationService.setGetToken(getToken);
  }, [getToken]);

  useEffect(() => {
    loadConvocations();
  }, []);

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadConvocations = async () => {
    try {
      setLoading(true);
      const response = await convocationService.getConvocations();
      setConvocations(response.convocations);
      setError(null);
    } catch (err) {
      setError('Error al cargar las convocatorias');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de validación
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.code.trim()) errors.code = 'Código requerido';
    if (!formData.title.trim()) errors.title = 'Título requerido';
    if (!formData.description.trim()) errors.description = 'Descripción requerida';
    if (!formData.start_date) errors.start_date = 'Fecha de inicio requerida';
    if (!formData.end_date) errors.end_date = 'Fecha de fin requerida';

    // Validar formato de código
    if (formData.code && !formData.code.match(/^CONV-\d{4}-\d{2}$/)) {
      errors.code = 'Formato debe ser CONV-YYYY-XX (ej: CONV-2025-01)';
    }

    // Validar fechas
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      is_active: true,
      is_published: false,
      max_applications: ''
    });
    setFormErrors({});
    setEditingConvocation(null);
  };

  // Funciones CRUD
  const handleCreateNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (convocation: Convocation) => {
    setEditingConvocation(convocation);
    setFormData({
      code: convocation.code,
      title: convocation.title,
      description: convocation.description || '',
      start_date: convocation.start_date,
      end_date: convocation.end_date,
      is_active: convocation.is_active,
      is_published: convocation.is_published,
      max_applications: convocation.max_applications?.toString() || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const convocationData: ConvocationCreateRequest = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        is_published: formData.is_published,
        max_applications: formData.max_applications ? parseInt(formData.max_applications) : undefined
      };

      if (editingConvocation) {
        await convocationService.updateConvocation(editingConvocation.id, convocationData);
        setSuccess('Convocatoria actualizada exitosamente');
      } else {
        await convocationService.createConvocation(convocationData);
        setSuccess('Convocatoria creada exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
      loadConvocations();
    } catch (err) {
      setError('Error al guardar la convocatoria');
    }
  };

  const handleDelete = async (convocation: Convocation) => {
    if (window.confirm(`¿Está seguro de eliminar la convocatoria "${convocation.title}"?`)) {
      try {
        await convocationService.deleteConvocation(convocation.id);
        setSuccess('Convocatoria eliminada exitosamente');
        loadConvocations();
      } catch (err) {
        setError('Error al eliminar la convocatoria');
      }
    }
  };

  const handleToggleActive = async (convocation: Convocation) => {
    try {
      if (convocation.is_active) {
        await convocationService.deactivateConvocation(convocation.id);
        setSuccess('Convocatoria desactivada exitosamente');
      } else {
        await convocationService.activateConvocation(convocation.id);
        setSuccess('Convocatoria activada exitosamente');
      }
      loadConvocations();
    } catch (err) {
      setError('Error al cambiar el estado de la convocatoria');
    }
  };

  const handleTogglePublish = async (convocation: Convocation) => {
    try {
      if (convocation.is_published) {
        await convocationService.unpublishConvocation(convocation.id);
        setSuccess('Convocatoria despublicada exitosamente');
      } else {
        await convocationService.publishConvocation(convocation.id);
        setSuccess('Convocatoria publicada exitosamente');
      }
      loadConvocations();
    } catch (err) {
      setError('Error al cambiar el estado de publicación');
    }
  };

  const handleInputChange = (field: keyof ConvocationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando se modifica
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const getStatusBadge = (convocation: Convocation) => {
    const now = new Date();
    const startDate = new Date(convocation.start_date);
    const endDate = new Date(convocation.end_date);

    let status = '';
    let colorClass = '';

    if (!convocation.is_active) {
      status = 'Inactiva';
      colorClass = 'bg-gray-100 text-gray-800';
    } else if (!convocation.is_published) {
      status = 'No Publicada';
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (now < startDate) {
      status = 'Próxima';
      colorClass = 'bg-blue-100 text-blue-800';
    } else if (now >= startDate && now <= endDate) {
      status = 'Vigente';
      colorClass = 'bg-green-100 text-green-800';
    } else {
      status = 'Expirada';
      colorClass = 'bg-red-100 text-red-800';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--tp-primary, #2563eb)' }}
          />
          <p className="text-gray-600">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏗️ Gestión de Convocatorias
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las convocatorias del programa Techo Propio
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="text-white font-bold py-2 px-4 rounded transition-all"
          style={{
            background: 'linear-gradient(to right, var(--tp-primary, #16a34a), var(--tp-secondary, #2563eb))'
          }}
        >
          ➕ Nueva Convocatoria
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div
          className="px-4 py-3 rounded border"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.05)',
            borderColor: 'var(--tp-accent, #dc2626)',
            color: 'var(--tp-accent, #dc2626)'
          }}
        >
          ❌ {error}
        </div>
      )}

      {success && (
        <div
          className="px-4 py-3 rounded border"
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.05)',
            borderColor: 'var(--tp-primary, #16a34a)',
            color: 'var(--tp-primary, #16a34a)'
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Lista de convocatorias */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Convocatorias Registradas
          </h3>

          {convocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay convocatorias registradas</p>
              <p className="text-sm text-gray-400">
                Las convocatorias se cargan desde datos de prueba en el backend
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Límite
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {convocations.map((convocation) => (
                    <tr key={convocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {convocation.code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {convocation.title}
                          </div>
                          {convocation.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {convocation.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(convocation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>📅 Inicio: {formatDate(convocation.start_date)}</div>
                        <div className="text-gray-500">📅 Fin: {formatDate(convocation.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {convocation.max_applications 
                          ? convocation.max_applications.toLocaleString() 
                          : 'Sin límite'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(convocation)}
                          className="transition-colors"
                          style={{ color: 'var(--tp-secondary, #2563eb)' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(convocation)}
                          className="transition-colors"
                          style={{
                            color: convocation.is_active
                              ? '#f97316'
                              : 'var(--tp-primary, #16a34a)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          title={convocation.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {convocation.is_active ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleTogglePublish(convocation)}
                          className="transition-colors"
                          style={{
                            color: convocation.is_published
                              ? '#9333ea'
                              : 'var(--tp-secondary, #2563eb)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          title={convocation.is_published ? 'Despublicar' : 'Publicar'}
                        >
                          {convocation.is_published ? '🔒' : '📢'}
                        </button>
                        <button
                          onClick={() => handleDelete(convocation)}
                          className="transition-colors"
                          style={{ color: 'var(--tp-accent, #dc2626)' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar convocatoria */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingConvocation ? 'Editar Convocatoria' : 'Nueva Convocatoria'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Código */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="CONV-2025-01"
                      disabled={!!editingConvocation}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.code ? 'border-red-300' : 'border-gray-300'
                      } ${editingConvocation ? 'bg-gray-100' : ''}`}
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                    )}
                  </div>
                  
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Cuarta Convocatoria 2025"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Fecha de Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.start_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.start_date && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.start_date}</p>
                    )}
                  </div>
                  
                  {/* Fecha de Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.end_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.end_date && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.end_date}</p>
                    )}
                  </div>
                  
                  {/* Límite de Solicitudes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Límite de Solicitudes (opcional)</label>
                    <input
                      type="number"
                      value={formData.max_applications}
                      onChange={(e) => handleInputChange('max_applications', e.target.value)}
                      placeholder="Dejar vacío para sin límite"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    placeholder="Descripción detallada de la convocatoria..."
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Estados */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Activa</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => handleInputChange('is_published', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Publicada</span>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="text-white font-bold py-2 px-4 rounded transition-all"
                    style={{
                      background: 'linear-gradient(to right, var(--tp-primary, #16a34a), var(--tp-secondary, #2563eb))'
                    }}
                  >
                    {editingConvocation ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvocationManagement;
