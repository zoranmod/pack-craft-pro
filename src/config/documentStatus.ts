/**
 * Centralized document status configuration - SINGLE SOURCE OF TRUTH
 * 
 * IMPORTANT: 'rejected' is hidden from UI but kept in DB for backward compatibility.
 * Any records with status='rejected' will display as 'Otkazano' in the UI.
 */

import { DocumentStatus } from '@/types/document';

// All possible statuses in the database (including legacy 'rejected' and 'pending')
export const ALL_DB_STATUSES: DocumentStatus[] = [
  'draft', 'sent', 'accepted', 'rejected', 'completed', 'cancelled'
];

// Statuses visible in UI (dropdowns, filters, etc.) - 'rejected' and 'pending' are excluded
export const UI_VISIBLE_STATUSES: DocumentStatus[] = [
  'draft', 'sent', 'accepted', 'completed', 'cancelled'
];

// Statuses for filters (excludes rejected for cleaner filtering)
export const FILTER_STATUSES: DocumentStatus[] = [
  'draft', 'sent', 'accepted', 'completed', 'cancelled'
];

// Labels for display - 'rejected' and 'pending' map to other statuses for legacy records
export const STATUS_LABELS: Record<string, string> = {
  'draft': 'U pripremi',
  'sent': 'Poslano',
  'accepted': 'Prihvaćeno',
  'rejected': 'Otkazano', // Display as 'Otkazano' for legacy records
  'pending': 'U pripremi', // Display as 'U pripremi' for legacy records
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

// Get display label for any status (handles rejected -> Otkazano mapping)
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

// Status styles for badges
export const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', // Same as cancelled
  pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400', // Maps to draft style for legacy
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

// Validate if a status should be visible in UI
export function isVisibleStatus(status: string): boolean {
  return UI_VISIBLE_STATUSES.includes(status as DocumentStatus);
}
