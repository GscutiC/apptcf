/**
 * ConfirmationModals - Modales de confirmación para acciones de estado
 * Agrupa todos los modales de confirmación para cambios de estado
 */

import React, { useState } from 'react';
import { Modal, Button } from '../common';

export type ModalType = 
  | 'submit' 
  | 'startReview' 
  | 'approve' 
  | 'reject' 
  | 'requestInfo' 
  | 'cancel' 
  | 'reactivate'
  | 'delete'
  | null;

export interface ModalState {
  type: ModalType;
  reason?: string;
  comments?: string;
}

interface ConfirmationModalsProps {
  showModal: ModalState;
  onClose: () => void;
  onConfirm: (type: ModalType, data?: { reason?: string; comments?: string }) => void;
  isLoading?: boolean;
}

export const ConfirmationModals: React.FC<ConfirmationModalsProps> = ({
  showModal,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  // Limpiar campos al cerrar
  const handleClose = () => {
    setReason('');
    setComments('');
    onClose();
  };

  // Confirmar acción
  const handleConfirm = () => {
    if (showModal.type === 'reject' || showModal.type === 'requestInfo') {
      onConfirm(showModal.type, { reason, comments });
    } else {
      onConfirm(showModal.type);
    }
    handleClose();
  };

  return (
    <>
      {/* Modal: Enviar */}
      <Modal
        isOpen={showModal.type === 'submit'}
        onClose={handleClose}
        title="📤 Enviar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-blue-900">¿Confirma enviar esta solicitud para revisión?</p>
              <p className="text-sm text-blue-700 mt-1">La solicitud pasará a estado "Enviada" y no podrá ser editada hasta que requiera información adicional.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleConfirm} variant="primary" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Confirmar Envío'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Iniciar Revisión */}
      <Modal
        isOpen={showModal.type === 'startReview'}
        onClose={handleClose}
        title="🔍 Iniciar Revisión"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-900">¿Desea iniciar la revisión de esta solicitud?</p>
              <p className="text-sm text-yellow-700 mt-1">La solicitud pasará a estado "En Revisión" y podrá ser aprobada, rechazada o requerir información adicional.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleConfirm} variant="primary" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Revisión'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Aprobar */}
      <Modal
        isOpen={showModal.type === 'approve'}
        onClose={handleClose}
        title="✅ Aprobar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-green-900">¿Confirma la aprobación de esta solicitud?</p>
              <p className="text-sm text-green-700 mt-1">Esta acción marcará la solicitud como aprobada. El solicitante será notificado.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleConfirm} variant="success" disabled={isLoading}>
              {isLoading ? 'Aprobando...' : 'Confirmar Aprobación'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Rechazar */}
      <Modal
        isOpen={showModal.type === 'reject'}
        onClose={handleClose}
        title="❌ Rechazar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-900">¿Confirma el rechazo de esta solicitud?</p>
              <p className="text-sm text-red-700 mt-1">Debe proporcionar un motivo detallado del rechazo.</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Describa claramente el motivo del rechazo..."
              required
            />
            {reason.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{reason.length} caracteres</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
            <Button 
              onClick={handleConfirm} 
              variant="danger" 
              disabled={isLoading || !reason.trim()}
            >
              {isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Solicitar Información */}
      <Modal
        isOpen={showModal.type === 'requestInfo'}
        onClose={handleClose}
        title="📝 Solicitar Información Adicional"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-orange-900">Solicitar información o documentos adicionales</p>
              <p className="text-sm text-orange-700 mt-1">La solicitud volverá al solicitante para que complete la información requerida.</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Información o documentos requeridos <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comments"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describa qué información o documentos necesita..."
              required
            />
            {comments.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{comments.length} caracteres</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Cancelar</Button>
            <Button 
              onClick={handleConfirm} 
              variant="primary" 
              disabled={isLoading || !comments.trim()}
            >
              {isLoading ? 'Enviando...' : 'Solicitar Información'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Cancelar */}
      <Modal
        isOpen={showModal.type === 'cancel'}
        onClose={handleClose}
        title="⚠️ Cancelar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">¿Confirma la cancelación de esta solicitud?</p>
              <p className="text-sm text-gray-700 mt-1">La solicitud será marcada como cancelada. Puede ser reactivada posteriormente si es necesario.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>No, Volver</Button>
            <Button onClick={handleConfirm} variant="danger" disabled={isLoading}>
              {isLoading ? 'Cancelando...' : 'Sí, Cancelar Solicitud'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reactivar */}
      <Modal
        isOpen={showModal.type === 'reactivate'}
        onClose={handleClose}
        title="🔄 Reactivar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-900">⚠️ Limitación del Sistema</p>
              <p className="text-sm text-yellow-700 mt-2">
                El sistema actualmente <strong>NO permite reactivar</strong> solicitudes canceladas debido a las reglas de negocio configuradas.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Opciones disponibles:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-1 space-y-1">
                <li>Eliminar esta solicitud y crear una nueva</li>
                <li>Contactar al administrador del sistema para permitir esta transición</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Eliminar */}
      <Modal
        isOpen={showModal.type === 'delete'}
        onClose={handleClose}
        title="🗑️ Eliminar Solicitud"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-red-900">⚠️ Esta acción es IRREVERSIBLE</p>
              <p className="text-sm text-red-700 mt-2">
                ¿Está completamente seguro de que desea <strong>eliminar definitivamente</strong> esta solicitud?
              </p>
              <p className="text-sm text-red-700 mt-2">
                Esta acción:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
                <li>Eliminará permanentemente todos los datos</li>
                <li>No se podrá recuperar la información</li>
                <li>Se perderá el historial completo</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="secondary" disabled={isLoading}>
              No, Cancelar
            </Button>
            <Button onClick={handleConfirm} variant="danger" disabled={isLoading}>
              {isLoading ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmationModals;
