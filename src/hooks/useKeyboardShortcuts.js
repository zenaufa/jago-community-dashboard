import { useEffect, useCallback } from 'react';

/**
 * Hook for registering keyboard shortcuts
 * @param {Object} shortcuts - Object mapping shortcut keys to callbacks
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(shortcuts, enabled = true) {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const tagName = event.target.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isEditable = event.target.isContentEditable;
    
    if (isInput || isEditable) {
      // Only allow Escape in inputs
      if (event.key !== 'Escape') return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    // Build shortcut key string
    let shortcutKey = '';
    if (modKey) shortcutKey += 'mod+';
    if (event.shiftKey) shortcutKey += 'shift+';
    if (event.altKey) shortcutKey += 'alt+';
    shortcutKey += event.key.toLowerCase();

    // Check for matching shortcut
    const callback = shortcuts[shortcutKey];
    if (callback) {
      event.preventDefault();
      callback(event);
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Common keyboard shortcut definitions
 */
export const SHORTCUTS = {
  SEARCH: 'mod+k',
  EXPORT: 'mod+e',
  ESCAPE: 'escape',
  TOGGLE_HIDDEN: 'mod+h',
};

