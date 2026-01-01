import { eachDayOfInterval, parseISO, getDay, format, isSaturday } from 'date-fns';

export interface ExcludedDate {
  date: string;
  reason: 'neradna_subota' | 'neradni_dan';
}

/**
 * Get all Saturdays within a date range
 */
export function getSaturdaysInRange(
  startDate: string | Date,
  endDate: string | Date
): string[] {
  if (!startDate || !endDate) return [];
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (end < start) return [];
  
  const days = eachDayOfInterval({ start, end });
  
  return days
    .filter(day => isSaturday(day))
    .map(day => format(day, 'yyyy-MM-dd'));
}

/**
 * Get all weekdays (Mon-Fri) within a date range
 */
export function getWeekdaysInRange(
  startDate: string | Date,
  endDate: string | Date
): string[] {
  if (!startDate || !endDate) return [];
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (end < start) return [];
  
  const days = eachDayOfInterval({ start, end });
  
  return days
    .filter(day => {
      const dayOfWeek = getDay(day);
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
    })
    .map(day => format(day, 'yyyy-MM-dd'));
}

/**
 * Calculate the number of working days between two dates
 * - Sunday (0) is NEVER counted
 * - Saturday (6) is counted ONLY if worksSaturday is true AND not in excluded dates with reason 'neradna_subota'
 * - Monday-Friday (1-5) are always counted UNLESS in excluded dates with reason 'neradni_dan'
 * 
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @param worksSaturday - Default Saturday behavior for this employee (can be overridden per-date)
 * @param excludedDates - Array of excluded dates with reasons
 * @returns Number of working days
 */
export function calculateWorkingDays(
  startDate: string | Date,
  endDate: string | Date,
  worksSaturday: boolean = false,
  excludedDates: ExcludedDate[] = []
): number {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (end < start) return 0;
  
  const days = eachDayOfInterval({ start, end });
  
  // Create a set of excluded dates for quick lookup
  const excludedSet = new Map<string, 'neradna_subota' | 'neradni_dan'>();
  excludedDates.forEach(ed => {
    excludedSet.set(ed.date, ed.reason);
  });
  
  return days.filter(day => {
    const dayOfWeek = getDay(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const exclusionReason = excludedSet.get(dateStr);
    
    // Sunday (0) - never count
    if (dayOfWeek === 0) return false;
    
    // Saturday (6)
    if (dayOfWeek === 6) {
      // If explicitly marked as neradna_subota, don't count
      if (exclusionReason === 'neradna_subota') return false;
      // Count if worksSaturday is true (and not excluded)
      return worksSaturday;
    }
    
    // Monday-Friday (1-5)
    // If marked as neradni_dan, don't count
    if (exclusionReason === 'neradni_dan') return false;
    
    return true;
  }).length;
}

/**
 * Format leave balance summary
 */
export function calculateLeaveBalance(
  totalDays: number,
  carriedOverDays: number,
  manualAdjustment: number,
  usedDays: number
): {
  fund: number;
  carriedOver: number;
  adjustment: number;
  used: number;
  remaining: number;
} {
  const remaining = totalDays + carriedOverDays + manualAdjustment - usedDays;
  return {
    fund: totalDays,
    carriedOver: carriedOverDays,
    adjustment: manualAdjustment,
    used: usedDays,
    remaining,
  };
}
