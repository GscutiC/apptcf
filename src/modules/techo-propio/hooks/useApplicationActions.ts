/**
 * useApplicationActions - Hook para manejar acciones de cambio de estado
 * Encapsula la lógica de negocio para cambios de estado de solicitudes
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useTechoPropioApplications } from './useTechoPropioApplications';
import { ApplicationStatus } from '../types';
import { ModalType, ModalState } from '../components/application/ConfirmationModals';

export const useApplicationActions = (applicationId?: string) => {
  const navigate = useNavigate();
  const { fetchApplication, refreshApplications, deleteApplication } = useTechoPropio();
  const { submitApplication, changeStatus } = useTechoPropioApplications();
  
  const [showModal, setShowModal] = useState<ModalState>({ type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Abrir modal
  const openModal = (type: ModalType) => {
    setShowModal({ type });
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal({ type: null });
    setError(null);
  };

  // Manejar confirmación de acción
  const handleConfirm = async (type: ModalType, data?: { reason?: string; comments?: string }) => {
    if (!applicationId) {
      setError('ID de solicitud no disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: any = null;
      let success = false;

      switch (type) {
        case 'submit':
          result = await submitApplication(applicationId);
          success = result !== null;
          break;

        case 'startReview':
          result = await changeStatus(applicationId, ApplicationStatus.UNDER_REVIEW);
          success = result !== null;
          break;

        case 'approve':
          result = await changeStatus(applicationId, ApplicationStatus.APPROVED);
          success = result !== null;
          break;

        case 'reject':
          if (data?.reason) {
            result = await changeStatus(applicationId, ApplicationStatus.REJECTED, data.reason);
            success = result !== null;
          } else {
            setError('Debe proporcionar un motivo de rechazo');
            setIsLoading(false);
            return;
          }
          break;

        case 'requestInfo':
          if (data?.comments) {
            result = await changeStatus(applicationId, ApplicationStatus.ADDITIONAL_INFO_REQUIRED, data.comments);
            success = result !== null;
          } else {
            setError('Debe especificar qué información requiere');
            setIsLoading(false);
            return;
          }
          break;

        case 'cancel':
          result = await changeStatus(applicationId, ApplicationStatus.CANCELLED);
          success = result !== null;
          break;

        case 'reactivate':
          // Reactivar vuelve a estado DRAFT
          result = await changeStatus(applicationId, ApplicationStatus.DRAFT);
          success = result !== null;
          break;

        case 'delete':
          result = await deleteApplication(applicationId);
          success = result === true;
          if (success) {
            // Navegar de vuelta a la lista después de eliminar
            closeModal();
            navigate('/techo-propio/solicitudes');
            return; // Salir temprano, no necesitamos refrescar
          }
          break;

        default:
          setError('Acción no reconocida');
          setIsLoading(false);
          return;
      }

      if (success) {
        // Cerrar modal PRIMERO
        closeModal();
        
        // Luego refrescar datos en segundo plano
        await Promise.all([
          fetchApplication(applicationId),
          refreshApplications()
        ]);
      } else {
        setError('Error al ejecutar la acción');
      }
    } catch (err) {
      console.error('Error en handleConfirm:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Acciones directas (sin modal)
  const actions = {
    edit: () => {
      if (applicationId) {
        navigate(`/techo-propio/editar/${applicationId}`);
      }
    },
    
    submit: () => openModal('submit'),
    startReview: () => openModal('startReview'),
    approve: () => openModal('approve'),
    reject: () => openModal('reject'),
    requestInfo: () => openModal('requestInfo'),
    cancel: () => openModal('cancel'),
    reactivate: () => openModal('reactivate'),
    delete: () => openModal('delete'),
    
    print: () => {
      window.print();
    }
  };

  return {
    actions,
    showModal,
    closeModal,
    handleConfirm,
    isLoading,
    error
  };
};

export default useApplicationActions;
