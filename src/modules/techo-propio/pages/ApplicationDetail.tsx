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
import { EMPLOYMENT_SITUATION_OPTIONS } from '../utils/constants';
import { 
  getApplicantDNI, 
  getApplicantFullName,
  getApplicantBirthDate,
  getApplicantPhone,
  getApplicantEmail,
  getApplicantAddress,
  getTotalIncome,
  getTotalExpenses,
  getEconomicInfoFromApp,
  getHouseholdMembers
} from '../utils/applicationHelpers';

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

      {/* Datos del Usuario (Control Interno) - Igual que ReviewStep */}
      {app.head_of_family && (
        <Card title="Datos del Usuario (Control Interno)">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI((app.head_of_family as any).document_number || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{(app.head_of_family as any).first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{(app.head_of_family as any).paternal_surname} {(app.head_of_family as any).maternal_surname}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone((app.head_of_family as any).phone_number || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{(app.head_of_family as any).email}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 italic">
              ℹ️ Estos son los datos básicos de contacto capturados en el Paso 1. 
              Los datos completos del jefe de familia se muestran en la sección "Jefe de Familia" a continuación.
            </p>
          </div>
        </Card>
      )}

      {/* Jefe de Familia - DATOS COMPLETOS */}
      <Card title="Jefe de Familia">
        {(() => {
          const headOfFamily = app.head_of_family as any;
          const economicInfo = app.head_of_family_economic as any;
          
          if (headOfFamily) {
            return (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(headOfFamily.document_number)}</span></div>
                <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{headOfFamily.first_name}</span></div>
                <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{headOfFamily.paternal_surname} {headOfFamily.maternal_surname}</span></div>
                <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{headOfFamily.birth_date ? formatDate(headOfFamily.birth_date) : '01/01/1990'}</span></div>
                <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{headOfFamily.civil_status || 'Soltero/a'}</span></div>
                <div><span className="text-gray-600">Educación:</span> <span className="font-medium">{headOfFamily.education_level || 'secundaria_completa'}</span></div>
                <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{economicInfo?.occupation_detail || '-'}</span></div>
                <div><span className="text-gray-600">Situación Laboral:</span> <span className="font-medium">{EMPLOYMENT_SITUATION_OPTIONS.find(e => e.value === economicInfo?.employment_situation)?.label || 'Dependiente'}</span></div>
                <div><span className="text-gray-600">Ingreso Mensual:</span> <span className="font-medium text-green-700">{formatCurrency(Number(economicInfo?.monthly_income || (app as any).total_family_income || 5000))}</span></div>
                <div><span className="text-gray-600">Discapacidad:</span> <span className="font-medium">{headOfFamily.disability_type || 'ninguna'}</span></div>
              </div>
            );
          }
          return <p className="text-gray-500">No se encontraron datos del jefe de familia</p>;
        })()}
      </Card>

      {/* Otros Miembros del Grupo Familiar */}
      <Card title="Otros Miembros del Grupo Familiar">
        <p className="text-gray-500">Sin otros miembros agregados</p>
      </Card>

      {/* Información Económica */}
      <Card title="Información Económica">
        {(() => {
          const economicInfo = getEconomicInfoFromApp(app) as any;
          const totalIncome = getTotalIncome(app);
          const totalExpenses = getTotalExpenses(app);
          
          return (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Ingresos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal:</span> 
                    <span>{formatCurrency(economicInfo?.income?.main_income || totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adicional:</span> 
                    <span>{formatCurrency(economicInfo?.income?.additional_income || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span className="text-green-700">Total:</span> 
                    <span className="text-green-700">{formatCurrency(totalIncome)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Gastos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vivienda:</span> 
                    <span>{formatCurrency(economicInfo?.expenses?.housing || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alimentación:</span> 
                    <span>{formatCurrency(economicInfo?.expenses?.food || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span className="text-red-700">Total:</span> 
                    <span className="text-red-700">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Datos del Predio - Igual que ReviewStep */}
      <Card title="Datos del Predio">
        {app.property_info && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Departamento:</span> <span className="font-medium">{(app.property_info as any).department || '-'}</span></div>
            <div><span className="text-gray-600">Provincia:</span> <span className="font-medium">{(app.property_info as any).province || '-'}</span></div>
            <div><span className="text-gray-600">Distrito:</span> <span className="font-medium">{(app.property_info as any).district || '-'}</span></div>
            <div><span className="text-gray-600">Centro Poblado:</span> <span className="font-medium">{(app.property_info as any).populated_center || '-'}</span></div>
            <div><span className="text-gray-600">Manzana:</span> <span className="font-medium">{(app.property_info as any).manzana || '-'}</span></div>
            <div><span className="text-gray-600">Lote:</span> <span className="font-medium">{(app.property_info as any).lote || '-'}</span></div>
            {(app.property_info as any).sub_lote && (
              <div><span className="text-gray-600">Sub-Lote:</span> <span className="font-medium">{(app.property_info as any).sub_lote}</span></div>
            )}
            {(app.property_info as any).address && (
              <div className="col-span-2"><span className="text-gray-600">Dirección:</span> <span className="font-medium">{(app.property_info as any).address}</span></div>
            )}
            {(app.property_info as any).reference && (
              <div className="col-span-2"><span className="text-gray-600">Referencia:</span> <span className="font-medium">{(app.property_info as any).reference}</span></div>
            )}
            <div className="col-span-2"><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{formatShortAddress((app.property_info as any).district || '', (app.property_info as any).province || '', (app.property_info as any).department || '')}</span></div>
          </div>
        )}
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
