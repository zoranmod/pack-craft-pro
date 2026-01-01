import { eachDayOfInterval, parseISO, getDay } from 'date-fns';

/**
 * Calculate the number of working days between two dates
 * - Sunday (0) is NEVER counted
 * - Saturday (6) is counted ONLY if worksSaturday is true
 * - Monday-Friday (1-5) are always counted
 * 
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @param worksSaturday - Whether Saturday counts as a working day for this employee
 * @returns Number of working days
 */
export function calculateWorkingDays(
  startDate: string | Date,
  endDate: string | Date,
  worksSaturday: boolean = false
): number {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (end < start) return 0;
  
  const days = eachDayOfInterval({ start, end });
  
  return days.filter(day => {
    const dayOfWeek = getDay(day);
    // Sunday (0) - never count
    if (dayOfWeek === 0) return false;
    // Saturday (6) - count only if worksSaturday
    if (dayOfWeek === 6) return worksSaturday;
    // Monday-Friday (1-5) - always count
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
