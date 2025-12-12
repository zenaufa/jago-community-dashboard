import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Clock, Tag, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function SearchAutocomplete({ 
  value, 
  onChange, 
  transactions = [],
  placeholder 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jago-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // Save search to recent
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('jago-recent-searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent searches', e);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('jago-recent-searches');
  };

  // Generate suggestions from transactions
  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return { merchants: [], types: [] };
    
    const searchLower = value.toLowerCase();
    
    // Get unique merchants matching the search
    const merchantCounts = {};
    const typeCounts = {};
    
    transactions.forEach(tx => {
      if (tx.source && tx.source.toLowerCase().includes(searchLower)) {
        merchantCounts[tx.source] = (merchantCounts[tx.source] || 0) + 1;
      }
      if (tx.type && tx.type.toLowerCase().includes(searchLower)) {
        typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
      }
    });
    
    const merchants = Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    const types = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
    
    return { merchants, types };
  }, [value, transactions]);

  const hasSuggestions = suggestions.merchants.length > 0 || suggestions.types.length > 0;
  const hasRecentSearches = recentSearches.length > 0 && !value;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (term) => {
    onChange(term);
    saveRecentSearch(term);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value) {
      saveRecentSearch(value);
      setIsOpen(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
        style={{ 
          backgroundColor: bgPrimary, 
          border: `1px solid ${isOpen ? accentColor : borderColor}`,
          color: textPrimary,
        }}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:opacity-70 transition-opacity"
          style={{ color: textSecondary }}
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (hasSuggestions || hasRecentSearches) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden z-50"
            style={{ 
              backgroundColor: bgCard, 
              border: `1px solid ${borderColor}`,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {/* Recent Searches */}
            {hasRecentSearches && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium" style={{ color: textSecondary }}>
                    {language === 'id' ? 'Pencarian Terakhir' : 'Recent Searches'}
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs hover:underline"
                    style={{ color: accentColor }}
                  >
                    {language === 'id' ? 'Hapus' : 'Clear'}
                  </button>
                </div>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(term)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accentColor}10`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                    <span className="text-sm" style={{ color: textPrimary }}>{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Merchant Suggestions */}
            {suggestions.merchants.length > 0 && (
              <div className="p-2" style={{ borderTop: hasRecentSearches ? `1px solid ${borderColor}` : 'none' }}>
                <span className="block px-2 py-1 text-xs font-medium" style={{ color: textSecondary }}>
                  {language === 'id' ? 'Merchant' : 'Merchants'}
                </span>
                {suggestions.merchants.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(item.name)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accentColor}10`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Building2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span className="text-sm flex-1 truncate" style={{ color: textPrimary }}>{item.name}</span>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      {item.count} {language === 'id' ? 'transaksi' : 'transactions'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Type Suggestions */}
            {suggestions.types.length > 0 && (
              <div className="p-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                <span className="block px-2 py-1 text-xs font-medium" style={{ color: textSecondary }}>
                  {language === 'id' ? 'Jenis Transaksi' : 'Transaction Types'}
                </span>
                {suggestions.types.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(item.name)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accentColor}10`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Tag className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
                    <span className="text-sm flex-1" style={{ color: textPrimary }}>{item.name}</span>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      {item.count} {language === 'id' ? 'transaksi' : 'transactions'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

