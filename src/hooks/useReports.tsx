import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerUserId } from '@/hooks/useOwnerUserId';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';

export interface ClientReportData {
  clientName: string;
  totalDocuments: number;
  totalAmount: number;
  documentsByType: Record<string, number>;
  documentsByStatus: Record<string, number>;
}

export interface ConversionReportData {
  totalQuotes: number;
  acceptedQuotes: number;
  conversionRate: number;
  convertedToContract: number;
  convertedToDelivery: number;
  convertedToInvoice: number;
}

export interface MonthlyReportData {
  month: string;
  monthLabel: string;
  totalDocuments: number;
  totalAmount: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  year?: number;
}

export function useClientReport(filters?: ReportFilters) {
  const { user } = useAuth();
  const ownerQuery = useOwnerUserId();
  const effectiveUserId = ownerQuery.data || user?.id;

  return useQuery({
    queryKey: ['client-report', effectiveUserId, filters],
    queryFn: async (): Promise<ClientReportData[]> => {
      if (!effectiveUserId) return [];

      let query = supabase
        .from('documents')
        .select('client_name, type, status, total_amount')
        .eq('user_id', effectiveUserId)
        .is('deleted_at', null);

      if (filters?.startDate) {
        query = query.gte('date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters?.endDate) {
        query = query.lte('date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters?.year) {
        query = query
          .gte('date', `${filters.year}-01-01`)
          .lte('date', `${filters.year}-12-31`);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return [];

      // Aggregate by client
      const clientMap = new Map<string, ClientReportData>();
      
      for (const doc of data) {
        const existing = clientMap.get(doc.client_name) || {
          clientName: doc.client_name,
          totalDocuments: 0,
          totalAmount: 0,
          documentsByType: {},
          documentsByStatus: {},
        };

        existing.totalDocuments++;
        existing.totalAmount += doc.total_amount || 0;
        existing.documentsByType[doc.type] = (existing.documentsByType[doc.type] || 0) + 1;
        existing.documentsByStatus[doc.status] = (existing.documentsByStatus[doc.status] || 0) + 1;

        clientMap.set(doc.client_name, existing);
      }

      return Array.from(clientMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    },
    enabled: !!effectiveUserId,
  });
}

export function useConversionReport(filters?: ReportFilters) {
  const { user } = useAuth();
  const { data: ownerUserId } = useOwnerUserId();
  const effectiveUserId = ownerUserId || user?.id;

  return useQuery({
    queryKey: ['conversion-report', effectiveUserId, filters],
    queryFn: async (): Promise<ConversionReportData> => {
      if (!effectiveUserId) {
        return {
          totalQuotes: 0,
          acceptedQuotes: 0,
          conversionRate: 0,
          convertedToContract: 0,
          convertedToDelivery: 0,
          convertedToInvoice: 0,
        };
      }

      let query = supabase
        .from('documents')
        .select('id, type, status, source_document_id')
        .eq('user_id', effectiveUserId)
        .is('deleted_at', null);

      if (filters?.startDate) {
        query = query.gte('date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters?.endDate) {
        query = query.lte('date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters?.year) {
        query = query
          .gte('date', `${filters.year}-01-01`)
          .lte('date', `${filters.year}-12-31`);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) {
        return {
          totalQuotes: 0,
          acceptedQuotes: 0,
          conversionRate: 0,
          convertedToContract: 0,
          convertedToDelivery: 0,
          convertedToInvoice: 0,
        };
      }

      const quotes = data.filter(d => d.type === 'ponuda');
      const acceptedQuotes = quotes.filter(d => d.status === 'accepted');
      
      // Count documents that were converted from quotes
      const quoteIds = new Set(quotes.map(q => q.id));
      const convertedFromQuotes = data.filter(d => d.source_document_id && quoteIds.has(d.source_document_id));

      return {
        totalQuotes: quotes.length,
        acceptedQuotes: acceptedQuotes.length,
        conversionRate: quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0,
        convertedToContract: convertedFromQuotes.filter(d => d.type === 'ugovor').length,
        convertedToDelivery: convertedFromQuotes.filter(d => d.type === 'otpremnica' || d.type === 'nalog-dostava-montaza').length,
        convertedToInvoice: convertedFromQuotes.filter(d => d.type === 'racun').length,
      };
    },
    enabled: !!effectiveUserId,
  });
}

export function useMonthlyReport(filters?: ReportFilters) {
  const { user } = useAuth();
  const { data: ownerUserId } = useOwnerUserId();
  const effectiveUserId = ownerUserId || user?.id;

  return useQuery({
    queryKey: ['monthly-report', effectiveUserId, filters],
    queryFn: async (): Promise<MonthlyReportData[]> => {
      if (!effectiveUserId) return [];

      const year = filters?.year || new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('documents')
        .select('date, type, status, total_amount')
        .eq('user_id', effectiveUserId)
        .is('deleted_at', null)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

      if (error) throw error;
      if (!data) return [];

      // Aggregate by month
      const monthMap = new Map<string, MonthlyReportData>();

      // Initialize all 12 months
      for (let m = 0; m < 12; m++) {
        const monthKey = format(new Date(year, m, 1), 'yyyy-MM');
        const monthLabel = format(new Date(year, m, 1), 'MMMM');
        monthMap.set(monthKey, {
          month: monthKey,
          monthLabel,
          totalDocuments: 0,
          totalAmount: 0,
          byType: {},
          byStatus: {},
        });
      }

      for (const doc of data) {
        const monthKey = doc.date.substring(0, 7); // yyyy-MM
        const existing = monthMap.get(monthKey);
        if (!existing) continue;

        existing.totalDocuments++;
        existing.totalAmount += doc.total_amount || 0;
        existing.byType[doc.type] = (existing.byType[doc.type] || 0) + 1;
        existing.byStatus[doc.status] = (existing.byStatus[doc.status] || 0) + 1;
      }

      return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    },
    enabled: !!effectiveUserId,
  });
}
