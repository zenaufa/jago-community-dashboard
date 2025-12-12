import { useLocalStorage } from './useLocalStorage';
import { useCallback, useMemo } from 'react';

const DEFAULT_RULES = [
  { id: '1', pattern: 'INDOMARET', category: 'Groceries', isRegex: false },
  { id: '2', pattern: 'ALFAMART', category: 'Groceries', isRegex: false },
  { id: '3', pattern: 'GOPAY', category: 'E-Wallet', isRegex: false },
  { id: '4', pattern: 'OVO', category: 'E-Wallet', isRegex: false },
];

export function useCustomCategories() {
  const [rules, setRules] = useLocalStorage('fin_category_rules', DEFAULT_RULES);

  // Add a new rule
  const addRule = useCallback((pattern, category, isRegex = false) => {
    const newRule = {
      id: Date.now().toString(),
      pattern,
      category,
      isRegex,
    };
    setRules(prev => [...prev, newRule]);
    return newRule;
  }, [setRules]);

  // Update an existing rule
  const updateRule = useCallback((id, updates) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, [setRules]);

  // Remove a rule
  const removeRule = useCallback((id) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, [setRules]);

  // Reorder rules (for priority)
  const reorderRules = useCallback((fromIndex, toIndex) => {
    setRules(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, [setRules]);

  // Reset to default rules
  const resetRules = useCallback(() => {
    setRules(DEFAULT_RULES);
  }, [setRules]);

  // Apply rules to categorize a transaction
  const categorize = useCallback((transaction) => {
    const source = (transaction.source || '').toUpperCase();
    const type = (transaction.type || '').toUpperCase();
    const searchText = `${source} ${type}`;

    for (const rule of rules) {
      try {
        if (rule.isRegex) {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(searchText)) {
            return rule.category;
          }
        } else {
          if (searchText.includes(rule.pattern.toUpperCase())) {
            return rule.category;
          }
        }
      } catch (e) {
        // Invalid regex, skip
        console.warn(`Invalid regex pattern: ${rule.pattern}`);
      }
    }

    return null; // No custom category matched
  }, [rules]);

  // Get unique categories from rules
  const categories = useMemo(() => {
    const cats = new Set(rules.map(r => r.category));
    return Array.from(cats).sort();
  }, [rules]);

  return {
    rules,
    categories,
    addRule,
    updateRule,
    removeRule,
    reorderRules,
    resetRules,
    categorize,
  };
}

