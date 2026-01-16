import { DocumentType } from '@/types/document';
import { 
  FileText, 
  Package, 
  Receipt, 
  FileSignature, 
  Truck,
  ClipboardList,
  type LucideIcon 
} from 'lucide-react';

/**
 * Centralized document type styling - SINGLE SOURCE OF TRUTH
 * 
 * Colors:
 * - Ponuda (offer): amber
 * - Otpremnica (delivery note): green
 * - Račun (invoice): blue
 * - Ugovor (contract): purple
 * - Nalog (work order): cyan/teal
 */

export interface DocumentTypeStyle {
  // Icon styling
  iconBg: string;
  iconFg: string;
  // Badge styling
  badgeBg: string;
  badgeFg: string;
  // Optional row border
  borderColor: string;
  // Lucide icon component
  icon: LucideIcon;
  // Emoji fallback
  emoji: string;
}

export const documentTypeStyles: Record<DocumentType, DocumentTypeStyle> = {
  ponuda: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconFg: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/15',
    badgeFg: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-l-amber-500',
    icon: FileText,
    emoji: '📄',
  },
  otpremnica: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconFg: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    badgeFg: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-l-emerald-500',
    icon: Package,
    emoji: '📦',
  },
  racun: {
    iconBg: 'bg-blue-100 dark:bg-blue-500/15',
    iconFg: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-500/15',
    badgeFg: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-l-blue-500',
    icon: Receipt,
    emoji: '🧾',
  },
  ugovor: {
    iconBg: 'bg-purple-100 dark:bg-purple-500/15',
    iconFg: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-500/15',
    badgeFg: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-l-purple-500',
    icon: FileSignature,
    emoji: '📝',
  },
  'nalog-dostava-montaza': {
    iconBg: 'bg-cyan-100 dark:bg-cyan-500/15',
    iconFg: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-500/15',
    badgeFg: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-l-cyan-500',
    icon: Truck,
    emoji: '🚚',
  },
  'ponuda-komarnici': {
    iconBg: 'bg-teal-100 dark:bg-teal-500/15',
    iconFg: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-100 dark:bg-teal-500/15',
    badgeFg: 'text-teal-700 dark:text-teal-400',
    borderColor: 'border-l-teal-500',
    icon: FileText,
    emoji: '🪟',
  },
  'reklamacija': {
    iconBg: 'bg-rose-100 dark:bg-rose-500/15',
    iconFg: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-500/15',
    badgeFg: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-l-rose-500',
    icon: ClipboardList,
    emoji: '📋',
  },
};

/**
 * Get styles for a document type
 */
export function getDocumentTypeStyle(type: DocumentType): DocumentTypeStyle {
  return documentTypeStyles[type] || documentTypeStyles.ponuda;
}

/**
 * Get icon component for a document type
 */
export function getDocumentTypeIcon(type: DocumentType): LucideIcon {
  return documentTypeStyles[type]?.icon || FileText;
}

/**
 * Document type badge component classes
 */
export function getDocumentTypeBadgeClasses(type: DocumentType): string {
  const style = getDocumentTypeStyle(type);
  return `${style.badgeBg} ${style.badgeFg}`;
}

/**
 * Document type icon container classes
 */
export function getDocumentTypeIconClasses(type: DocumentType): { container: string; icon: string } {
  const style = getDocumentTypeStyle(type);
  return {
    container: style.iconBg,
    icon: style.iconFg,
  };
}
