/**
 * ApplicationDetail Page - Vista detallada de solicitud con gestión de estados
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useApplicationActions } from '../hooks';
import { Card, Button } from '../components/common';
import { StatusBadge, PriorityIndicator, StatusActionBar, ConfirmationModals } from '../components/application';
import { formatDate, formatCurrency, formatShortAddress, formatDNI, formatPhone } from '../utils';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedApplication, fetchApplication, isLoading } = useTechoPropio();
  
  // Hook para gestión de acciones
  const { actions, showModal, closeModal, handleConfirm, isLoading: isActionLoading } = useApplicationActions(id);

  useEffect(() => {
    if (id) fetchApplication(id);
  }, [id, fetchApplication]);

  if (isLoading || !selectedApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  const app = selectedApplication;

  return (
    <div className="space-y-6">
      {/* Header con barra de acciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/techo-propio/solicitudes')} 
          size="sm"
        >
          ← Volver
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mt-4">
          {/* Información de la solicitud */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{app.code}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={app.status} />
              <PriorityIndicator score={app.priority_score} />
            </div>
          </div>
          
          {/* 🆕 Barra de acciones contextual */}
          <StatusActionBar
            application={app}
            onEdit={actions.edit}
            onSubmit={actions.submit}
            onStartReview={actions.startReview}
            onApprove={actions.approve}
            onReject={actions.reject}
            onRequestInfo={actions.requestInfo}
            onCancel={actions.cancel}
            onReactivate={actions.reactivate}
            onDelete={actions.delete}
            onPrint={actions.print}
            disabled={isActionLoading}
          />
        </div>
      </div>

      {/* Solicitante */}
      <Card title="Datos del Solicitante">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(app.applicant.dni)}</span></div>
          <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{app.applicant.first_name} {app.applicant.last_name}</span></div>
          <div><span className="text-gray-600">Nacimiento:</span> <span className="font-medium">{formatDate(app.applicant.birth_date)}</span></div>
          <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(app.applicant.phone)}</span></div>
          <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{app.applicant.email}</span></div>
          <div className="col-span-3"><span className="text-gray-600">Dirección:</span> <span className="font-medium">{app.applicant.current_address.address}, {formatShortAddress(app.applicant.current_address.district, app.applicant.current_address.province, app.applicant.current_address.department)}</span></div>
        </div>
      </Card>

      {/* Grupo Familiar */}
      <Card title={`Grupo Familiar (${app.household_members.length} miembros)`}>
        <div className="space-y-2">
          {app.household_members.map((member, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between">
              <div>
                <p className="font-medium">{member.first_name} {member.apellido_paterno} {member.apellido_materno}</p>
                <p className="text-sm text-gray-600">DNI: {formatDNI(member.dni)} | {member.occupation || 'N/A'}</p>
              </div>
              <p className="font-semibold text-green-700">{formatCurrency(member.monthly_income || 0)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Información Económica */}
      <Card title="Información Económica">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Ingresos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Principal:</span> <span>{formatCurrency(app.economic_info.income.main_income)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Adicional:</span> <span>{formatCurrency(app.economic_info.income.additional_income)}</span></div>
              <div className="flex justify-between pt-2 border-t font-bold"><span className="text-green-700">Total:</span> <span className="text-green-700">{formatCurrency(app.economic_info.income.total_income)}</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Gastos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Vivienda:</span> <span>{formatCurrency(app.economic_info.expenses.housing)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Alimentación:</span> <span>{formatCurrency(app.economic_info.expenses.food)}</span></div>
              <div className="flex justify-between pt-2 border-t font-bold"><span className="text-red-700">Total:</span> <span className="text-red-700">{formatCurrency(app.economic_info.expenses.total_expenses)}</span></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Predio */}
      <Card title="Datos del Predio">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-600">Departamento:</span> <span className="font-medium">{app.property_info.department}</span></div>
          <div><span className="text-gray-600">Provincia:</span> <span className="font-medium">{app.property_info.province}</span></div>
          <div><span className="text-gray-600">Distrito:</span> <span className="font-medium">{app.property_info.district}</span></div>
          <div><span className="text-gray-600">Lote:</span> <span className="font-medium">{app.property_info.lote}</span></div>
          {app.property_info.manzana && (
            <div><span className="text-gray-600">Manzana:</span> <span className="font-medium">{app.property_info.manzana}</span></div>
          )}
          {app.property_info.populated_center && (
            <div><span className="text-gray-600">Centro Poblado:</span> <span className="font-medium">{app.property_info.populated_center}</span></div>
          )}
          <div className="col-span-3"><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{formatShortAddress(app.property_info.district, app.property_info.province, app.property_info.department)}</span></div>
        </div>
      </Card>

      {/* Timeline */}
      <Card title="Historial">
        <div className="text-sm text-gray-600">
          <p>Creada: {formatDate(app.created_at)}</p>
          <p>Última actualización: {formatDate(app.updated_at)}</p>
        </div>
      </Card>

      {/* 🆕 Modales de confirmación */}
      <ConfirmationModals
        showModal={showModal}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ApplicationDetail;
