import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PublicHoliday } from '@/types/calendar';
import { toast } from 'sonner';

const mapDbToHoliday = (row: any): PublicHoliday => ({
  id: row.id,
  userId: row.user_id,
  countryCode: row.country_code,
  date: row.date,
  name: row.name,
  isNonWorking: row.is_non_working,
  source: row.source as 'auto' | 'admin',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Calculate Easter Sunday using Anonymous Gregorian algorithm
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Get Croatian holidays for a year
function getCroatianHolidays(year: number): Array<{ date: string; name: string }> {
  const holidays: Array<{ date: string; name: string }> = [];
  
  // Fixed holidays
  holidays.push({ date: `${year}-01-01`, name: 'Nova godina' });
  holidays.push({ date: `${year}-01-06`, name: 'Bogojavljenje' });
  holidays.push({ date: `${year}-05-01`, name: 'Praznik rada' });
  holidays.push({ date: `${year}-05-30`, name: 'Dan državnosti' });
  holidays.push({ date: `${year}-06-22`, name: 'Dan antifašističke borbe' });
  holidays.push({ date: `${year}-08-05`, name: 'Dan pobjede' });
  holidays.push({ date: `${year}-08-15`, name: 'Velika Gospa' });
  holidays.push({ date: `${year}-11-01`, name: 'Svi sveti' });
  holidays.push({ date: `${year}-11-18`, name: 'Dan sjećanja' });
  holidays.push({ date: `${year}-12-25`, name: 'Božić' });
  holidays.push({ date: `${year}-12-26`, name: 'Sveti Stjepan' });
  
  // Movable holidays based on Easter
  const easter = calculateEaster(year);
  
  // Easter Sunday
  const easterStr = easter.toISOString().split('T')[0];
  holidays.push({ date: easterStr, name: 'Uskrs' });
  
  // Easter Monday (Easter + 1 day)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays.push({ date: easterMonday.toISOString().split('T')[0], name: 'Uskrsni ponedjeljak' });
  
  // Corpus Christi / Tijelovo (Easter + 60 days)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays.push({ date: corpusChristi.toISOString().split('T')[0], name: 'Tijelovo' });
  
  return holidays;
}

export function usePublicHolidays(year?: number) {
  const { user } = useAuth();
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['public-holidays', user?.id, currentYear],
    queryFn: async () => {
      if (!user) return [];

      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('public_holidays')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToHoliday);
    },
    enabled: !!user,
  });
}

export function useEnsureHolidays() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (year: number) => {
      if (!user) throw new Error('Not authenticated');

      const holidays = getCroatianHolidays(year);
      
      // Upsert holidays (ignore conflicts on unique constraint)
      for (const holiday of holidays) {
        const { error } = await supabase
          .from('public_holidays')
          .upsert(
            {
              user_id: user.id,
              country_code: 'HR',
              date: holiday.date,
              name: holiday.name,
              is_non_working: true,
              source: 'auto',
            },
            { onConflict: 'user_id,country_code,date' }
          );
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error inserting holiday:', error);
        }
      }

      return true;
    },
    onSuccess: (_, year) => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays', user?.id, year] });
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { date: string; name: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: holiday, error } = await supabase
        .from('public_holidays')
        .insert({
          user_id: user.id,
          country_code: 'HR',
          date: data.date,
          name: data.name,
          is_non_working: true,
          source: 'admin',
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToHoliday(holiday);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast.success('Blagdan dodan!');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name?: string; isNonWorking?: boolean }) => {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.isNonWorking !== undefined) updateData.is_non_working = data.isNonWorking;

      const { data: holiday, error } = await supabase
        .from('public_holidays')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToHoliday(holiday);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast.success('Blagdan ažuriran!');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holidayId: string) => {
      const { error } = await supabase
        .from('public_holidays')
        .delete()
        .eq('id', holidayId);

      if (error) throw error;
      return holidayId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast.success('Blagdan obrisan!');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });
}

// Get holiday dates as string array for leave calculations
export function useHolidayDates(year?: number) {
  const { data: holidays } = usePublicHolidays(year);
  
  return (holidays || [])
    .filter(h => h.isNonWorking)
    .map(h => h.date);
}
