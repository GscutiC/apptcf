/**
 * ApplicationList Page - Lista de solicitudes con filtros
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useTechoPropioApplications } from '../hooks';
import { Card, Button, FormSelect, Modal } from '../components/common';
import { ApplicationCard } from '../components/application';
import { ApplicationStatus } from '../types';
import { STATUS_CONFIG } from '../utils';

export const ApplicationList: React.FC = () => {
  const navigate = useNavigate();
  const { applications, isLoading, filters, setFilters, refreshApplications } = useTechoPropio();
  const { deleteApplication } = useTechoPropioApplications();
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id?: string }>({ show: false });

  useEffect(() => {
    refreshApplications();
  }, []);

  const handleDelete = async () => {
    if (deleteModal.id) {
      const success = await deleteApplication(deleteModal.id);
      if (success) {
        refreshApplications();
        setDeleteModal({ show: false });
      }
    }
  };

  const statusOptions = Object.values(ApplicationStatus).map(value => ({
    value: value,
    label: STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.label || value
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-gray-600 mt-1">Gestione todas las solicitudes del programa</p>
        </div>
        <Button onClick={() => navigate('/techo-propio/nueva')} size="lg">Nueva Solicitud</Button>
      </div>

      {/* Filtros */}
      <Card title="Filtros">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            label="Estado"
            value={filters.status?.[0] || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value as ApplicationStatus] : undefined })}
            options={statusOptions}
            placeholder="Todos los estados"
          />
          <div className="flex items-end gap-2">
            <Button onClick={() => setFilters({})}>Limpiar</Button>
            <Button variant="secondary" onClick={refreshApplications}>Actualizar</Button>
          </div>
        </div>
      </Card>

      {/* Lista */}
      <Card title={`Resultados (${applications.length})`}>
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" /><p>Cargando...</p></div>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => navigate(`/techo-propio/ver/${app.id}`)}
                onEdit={() => navigate(`/techo-propio/editar/${app.id}`)}
                onDelete={() => setDeleteModal({ show: true, id: app.id })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-medium">No se encontraron solicitudes</p>
            <Button onClick={() => navigate('/techo-propio/nueva')} className="mt-4">Crear Primera Solicitud</Button>
          </div>
        )}
      </Card>

      {/* Modal Delete */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false })}
        title="Confirmar Eliminación"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false })}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
          </>
        }
      >
        <p>¿Está seguro de eliminar esta solicitud? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default ApplicationList;
