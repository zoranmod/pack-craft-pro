import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateHR(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  let d: Date;
  if (typeof date === 'string') {
    // Handle YYYY-MM-DD format without timezone issues
    const parts = date.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}.`;
}

// Round number to 2 decimal places
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Format currency with 2 decimal places
export function formatCurrency(value: number): string {
  return round2(value).toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
