/**
 * Formatting utilities for Techo Propio Module
 */

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMATS } from './constants';
import { ApplicationStatus } from '../types';

// ==================== DATE FORMATTERS ====================

export const formatDate = (date: string | Date, formatString: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatDateForAPI = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.API);
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;

    return formatDate(date);
  } catch (error) {
    return 'Fecha inválida';
  }
};

// ==================== CURRENCY FORMATTERS ====================

export const formatCurrency = (amount: number, includeDecimals: boolean = true): string => {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  });

  return formatter.format(amount);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// ==================== TEXT FORMATTERS ====================

export const formatDNI = (dni: string): string => {
  // Format DNI as XX XXX XXX
  if (!dni || dni.length !== 8) return dni;
  return `${dni.substring(0, 2)} ${dni.substring(2, 5)} ${dni.substring(5, 8)}`;
};

export const formatPhone = (phone: string): string => {
  // Format phone as XXX XXX XXX
  if (!phone || phone.length !== 9) return phone;
  return `${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6, 9)}`;
};

export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const formatApplicationCode = (code: string): string => {
  return code.toUpperCase();
};

// ==================== STATUS FORMATTERS ====================

export const formatStatus = (status: ApplicationStatus): string => {
  const statusMap: Record<ApplicationStatus, string> = {
    [ApplicationStatus.DRAFT]: 'Borrador',
    [ApplicationStatus.SUBMITTED]: 'Enviada',
    [ApplicationStatus.IN_REVIEW]: 'En Revisión',
    [ApplicationStatus.APPROVED]: 'Aprobada',
    [ApplicationStatus.REJECTED]: 'Rechazada',
    [ApplicationStatus.CANCELLED]: 'Cancelada'
  };

  return statusMap[status] || status;
};

// ==================== PRIORITY FORMATTERS ====================

export const formatPriority = (score: number): string => {
  if (score >= 80) return 'Alta';
  if (score >= 50) return 'Media';
  return 'Baja';
};

export const getPriorityColor = (score: number): string => {
  if (score >= 80) return 'red';
  if (score >= 50) return 'yellow';
  return 'green';
};

// ==================== ADDRESS FORMATTERS ====================

export const formatAddress = (address: {
  address: string;
  district: string;
  province: string;
  department: string;
  reference?: string;
}): string => {
  const parts = [
    address.address,
    address.district,
    address.province,
    address.department
  ].filter(Boolean);

  let formatted = parts.join(', ');

  if (address.reference) {
    formatted += ` (Ref: ${address.reference})`;
  }

  return formatted;
};

export const formatShortAddress = (district: string, province: string, department: string): string => {
  return `${district}, ${province}, ${department}`;
};

// ==================== PERCENTAGE FORMATTERS ====================

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${formatNumber(value, decimals)}%`;
};

// ==================== FILE SIZE FORMATTERS ====================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ==================== TRUNCATE TEXT ====================

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// ==================== CAPITALIZE ====================

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// ==================== UBIGEO FORMATTERS ====================

export const formatUbigeoCode = (code: string): string => {
  // Format UBIGEO as XX-XX-XX
  if (!code || code.length !== 6) return code;
  return `${code.substring(0, 2)}-${code.substring(2, 4)}-${code.substring(4, 6)}`;
};

// ==================== HOUSEHOLD SIZE ====================

export const formatHouseholdSize = (size: number): string => {
  if (size === 1) return '1 persona';
  return `${size} personas`;
};

// ==================== INCOME/EXPENSE SUMMARY ====================

export const formatIncomeExpenseRatio = (income: number, expenses: number): string => {
  if (expenses === 0) return 'N/A';
  const ratio = (income / expenses).toFixed(2);
  return `${ratio}:1`;
};

export const formatAvailableIncome = (income: number, expenses: number): string => {
  const available = income - expenses;
  return formatCurrency(available);
};

// ==================== ARRAY FORMATTERS ====================

export const formatList = (items: string[], separator: string = ', ', lastSeparator: string = ' y '): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSeparator);

  const allButLast = items.slice(0, -1).join(separator);
  const last = items[items.length - 1];

  return `${allButLast}${lastSeparator}${last}`;
};

// ==================== DOCUMENT TYPE FORMATTERS ====================

export const formatDocumentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'dni': 'DNI',
    'recibo_luz': 'Recibo de Luz',
    'recibo_agua': 'Recibo de Agua',
    'plano': 'Plano del Terreno',
    'declaracion_jurada': 'Declaración Jurada',
    'foto_predio': 'Foto del Predio',
    'otro': 'Otro Documento'
  };

  return typeMap[type.toLowerCase()] || capitalize(type);
};

// ==================== EMPTY STATE FORMATTERS ====================

export const formatEmptyValue = (value: any, defaultText: string = '-'): string => {
  if (value === null || value === undefined || value === '') {
    return defaultText;
  }
  return String(value);
};
