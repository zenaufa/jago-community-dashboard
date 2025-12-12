import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';

/**
 * Hook for managing transaction notes and tags
 */
export function useTransactionNotes() {
  const [notes, setNotes] = useLocalStorage('fin_transaction_notes', {});
  const [tags, setTags] = useLocalStorage('fin_transaction_tags', {});
  const [availableTags, setAvailableTags] = useLocalStorage('fin_available_tags', [
    'Business',
    'Personal',
    'Vacation',
    'Tax Deductible',
    'Urgent',
    'Review',
  ]);

  // Get note for a transaction
  const getNote = useCallback((transactionId) => {
    return notes[transactionId] || '';
  }, [notes]);

  // Set note for a transaction
  const setNote = useCallback((transactionId, note) => {
    setNotes(prev => {
      if (!note || note.trim() === '') {
        const updated = { ...prev };
        delete updated[transactionId];
        return updated;
      }
      return { ...prev, [transactionId]: note.trim() };
    });
  }, [setNotes]);

  // Get tags for a transaction
  const getTags = useCallback((transactionId) => {
    return tags[transactionId] || [];
  }, [tags]);

  // Add tag to a transaction
  const addTag = useCallback((transactionId, tag) => {
    setTags(prev => {
      const current = prev[transactionId] || [];
      if (current.includes(tag)) return prev;
      return { ...prev, [transactionId]: [...current, tag] };
    });
    
    // Add to available tags if new
    setAvailableTags(prev => {
      if (prev.includes(tag)) return prev;
      return [...prev, tag];
    });
  }, [setTags, setAvailableTags]);

  // Remove tag from a transaction
  const removeTag = useCallback((transactionId, tag) => {
    setTags(prev => {
      const current = prev[transactionId] || [];
      const updated = current.filter(t => t !== tag);
      if (updated.length === 0) {
        const newTags = { ...prev };
        delete newTags[transactionId];
        return newTags;
      }
      return { ...prev, [transactionId]: updated };
    });
  }, [setTags]);

  // Toggle tag on a transaction
  const toggleTag = useCallback((transactionId, tag) => {
    const currentTags = tags[transactionId] || [];
    if (currentTags.includes(tag)) {
      removeTag(transactionId, tag);
    } else {
      addTag(transactionId, tag);
    }
  }, [tags, addTag, removeTag]);

  // Create a new available tag
  const createTag = useCallback((tag) => {
    if (!tag || tag.trim() === '') return;
    setAvailableTags(prev => {
      if (prev.includes(tag.trim())) return prev;
      return [...prev, tag.trim()];
    });
  }, [setAvailableTags]);

  // Delete an available tag (removes from all transactions too)
  const deleteAvailableTag = useCallback((tag) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
    setTags(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = updated[id].filter(t => t !== tag);
        if (updated[id].length === 0) {
          delete updated[id];
        }
      });
      return updated;
    });
  }, [setAvailableTags, setTags]);

  // Check if transaction has notes or tags
  const hasAnnotations = useCallback((transactionId) => {
    return !!(notes[transactionId] || (tags[transactionId] && tags[transactionId].length > 0));
  }, [notes, tags]);

  return {
    notes,
    tags,
    availableTags,
    getNote,
    setNote,
    getTags,
    addTag,
    removeTag,
    toggleTag,
    createTag,
    deleteAvailableTag,
    hasAnnotations,
  };
}

