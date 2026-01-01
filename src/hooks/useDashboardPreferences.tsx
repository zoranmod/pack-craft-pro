import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardSections {
  summary: boolean;
  quickActions: boolean;
  recentDocuments: boolean;
  activities: boolean;
  deadlines: boolean;
  analytics: boolean;
}

const DEFAULT_SECTIONS: DashboardSections = {
  summary: false,
  quickActions: true,
  recentDocuments: true,
  activities: true,
  deadlines: true,
  analytics: true,
};

const STORAGE_KEY = 'dashboard_sections_';

export function useDashboardPreferences() {
  const { user } = useAuth();
  const storageKey = user?.id ? `${STORAGE_KEY}${user.id}` : null;

  const [sections, setSections] = useState<DashboardSections>(() => {
    if (typeof window === 'undefined' || !storageKey) return DEFAULT_SECTIONS;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...DEFAULT_SECTIONS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse dashboard preferences', e);
    }
    return DEFAULT_SECTIONS;
  });

  // Re-load when user changes
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSections({ ...DEFAULT_SECTIONS, ...JSON.parse(stored) });
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    } catch (e) {
      setSections(DEFAULT_SECTIONS);
    }
  }, [storageKey]);

  // Persist on change
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sections));
    } catch (e) {
      console.error('Failed to save dashboard preferences', e);
    }
  }, [sections, storageKey]);

  const toggleSection = useCallback((key: keyof DashboardSections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setSection = useCallback((key: keyof DashboardSections, value: boolean) => {
    setSections(prev => ({ ...prev, [key]: value }));
  }, []);

  return { sections, toggleSection, setSection };
}
