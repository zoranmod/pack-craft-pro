import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const YEAR_STORAGE_KEY = 'akord_year_filter';

export type YearFilter = number | 'all';

async function fetchAvailableYears(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('date')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) throw error;

  const years = new Set<number>();
  data?.forEach((doc) => {
    if (doc.date) {
      const year = new Date(doc.date).getFullYear();
      years.add(year);
    }
  });

  // Always include current year
  years.add(new Date().getFullYear());

  return Array.from(years).sort((a, b) => b - a);
}

export function useYearFilter() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial value from URL or localStorage
  const getInitialYear = (): YearFilter => {
    const urlYear = searchParams.get('year');
    if (urlYear) {
      return urlYear === 'all' ? 'all' : parseInt(urlYear, 10);
    }
    
    const storedYear = localStorage.getItem(YEAR_STORAGE_KEY);
    if (storedYear) {
      return storedYear === 'all' ? 'all' : parseInt(storedYear, 10);
    }
    
    return new Date().getFullYear();
  };

  const [selectedYear, setSelectedYear] = useState<YearFilter>(getInitialYear);

  // Fetch available years from database
  const { data: availableYears = [] } = useQuery({
    queryKey: ['available-years', user?.id],
    queryFn: () => fetchAvailableYears(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync with URL on mount
  useEffect(() => {
    const urlYear = searchParams.get('year');
    if (!urlYear) {
      // Set initial year in URL if not present
      const stored = localStorage.getItem(YEAR_STORAGE_KEY);
      if (stored) {
        setSearchParams((prev) => {
          prev.set('year', stored);
          return prev;
        }, { replace: true });
      }
    }
  }, []);

  // Update year with URL and localStorage sync
  const setYear = (year: YearFilter) => {
    setSelectedYear(year);
    
    // Update URL
    setSearchParams((prev) => {
      prev.set('year', String(year));
      return prev;
    }, { replace: true });
    
    // Update localStorage
    localStorage.setItem(YEAR_STORAGE_KEY, String(year));
  };

  // Listen to URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlYear = searchParams.get('year');
    if (urlYear) {
      const parsed = urlYear === 'all' ? 'all' : parseInt(urlYear, 10);
      if (parsed !== selectedYear) {
        setSelectedYear(parsed);
        localStorage.setItem(YEAR_STORAGE_KEY, String(parsed));
      }
    }
  }, [searchParams]);

  // Filter function to use in document filtering
  const filterByYear = useMemo(() => {
    return (date: string | null | undefined): boolean => {
      if (selectedYear === 'all') return true;
      if (!date) return false;
      
      const docYear = new Date(date).getFullYear();
      return docYear === selectedYear;
    };
  }, [selectedYear]);

  // Year range for date filtering
  const yearRange = useMemo(() => {
    if (selectedYear === 'all') {
      return { start: null, end: null };
    }
    return {
      start: `${selectedYear}-01-01`,
      end: `${selectedYear}-12-31`,
    };
  }, [selectedYear]);

  return {
    selectedYear,
    setYear,
    availableYears,
    filterByYear,
    yearRange,
    yearLabel: selectedYear === 'all' ? 'Sve godine' : String(selectedYear),
  };
}

export function useYearFilterContext() {
  return useYearFilter();
}
