import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutOptions {
  onSearch?: () => void;
  onNewDocument?: () => void;
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+K / Cmd+K — open search (navigate to documents with search focus)
      if (isModifier && e.key === 'k') {
        e.preventDefault();
        if (options.onSearch) {
          options.onSearch();
        } else {
          navigate('/documents');
        }
        return;
      }

      // Ctrl+N / Cmd+N — new document
      if (isModifier && e.key === 'n') {
        e.preventDefault();
        if (options.onNewDocument) {
          options.onNewDocument();
        } else {
          navigate('/documents/new?type=ponuda');
        }
        return;
      }

      // Escape — close modal or go back (only when not in input)
      if (e.key === 'Escape' && !isInput) {
        // Let Radix handle modal closing first — only navigate if no dialog is open
        const hasOpenDialog = document.querySelector('[data-state="open"][role="dialog"]');
        if (!hasOpenDialog) {
          e.preventDefault();
          window.history.back();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, options]);
}
