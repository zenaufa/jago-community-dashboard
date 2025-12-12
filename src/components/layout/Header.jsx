import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, Filter, RotateCcw, X, SlidersHorizontal, Upload, Download, Trash2, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Format date to YYYY-MM-DD using local time (not UTC)
function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Date preset helper functions
function getDatePresets(language) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  // Today (clean date without time)
  const today = new Date(year, month, day);
  
  // This month: 1st to last day
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);
  
  // Last month: 1st to last day
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);
  
  // Last 30 days: 29 days ago to today (30 days total including today)
  const last30Start = new Date(year, month, day - 29);
  
  // Last 3 months: from 2 months ago 1st to end of this month
  const last3MonthsStart = new Date(year, month - 2, 1);
  
  // This year: Jan 1 to today
  const thisYearStart = new Date(year, 0, 1);
  
  return [
    {
      id: 'this-month',
      label: language === 'id' ? 'Bulan Ini' : 'This Month',
      startDate: formatLocalDate(thisMonthStart),
      endDate: formatLocalDate(thisMonthEnd),
    },
    {
      id: 'last-month',
      label: language === 'id' ? 'Bulan Lalu' : 'Last Month',
      startDate: formatLocalDate(lastMonthStart),
      endDate: formatLocalDate(lastMonthEnd),
    },
    {
      id: 'last-30',
      label: language === 'id' ? '30 Hari' : 'Last 30 Days',
      startDate: formatLocalDate(last30Start),
      endDate: formatLocalDate(today),
    },
    {
      id: 'last-3-months',
      label: language === 'id' ? '3 Bulan' : '3 Months',
      startDate: formatLocalDate(last3MonthsStart),
      endDate: formatLocalDate(thisMonthEnd),
    },
    {
      id: 'this-year',
      label: language === 'id' ? 'Tahun Ini' : 'This Year',
      startDate: formatLocalDate(thisYearStart),
      endDate: formatLocalDate(today),
    },
  ];
}

import { SearchAutocomplete } from '../ui/SearchAutocomplete';

export function Header({ 
  filters, 
  updateFilters, 
  resetFilters, 
  dateRange, 
  transactionTypes,
  transactions = [],
  onUpload,
  onExport,
  onClear,
  hasData = true 
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Date presets
  const datePresets = useMemo(() => getDatePresets(language), [language]);
  
  // Check if current filter matches a preset
  const activePreset = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return null;
    return datePresets.find(
      p => p.startDate === filters.startDate && p.endDate === filters.endDate
    )?.id || null;
  }, [filters.startDate, filters.endDate, datePresets]);
  
  // Get display label for active date filter
  const activeDateLabel = useMemo(() => {
    if (activePreset) {
      return datePresets.find(p => p.id === activePreset)?.label || '';
    }
    if (filters.startDate && filters.endDate) {
      return language === 'id' ? 'Rentang Kustom' : 'Custom Range';
    }
    return language === 'id' ? 'Semua Periode' : 'All Time';
  }, [activePreset, filters.startDate, filters.endDate, datePresets, language]);
  
  // Apply a date preset
  const applyPreset = (preset) => {
    updateFilters({ startDate: preset.startDate, endDate: preset.endDate });
    setDateDropdownOpen(false);
  };
  
  // Clear date filters
  const clearDateFilters = () => {
    updateFilters({ startDate: '', endDate: '' });
    setDateDropdownOpen(false);
  };
  
  // Count active filters
  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.transactionType,
    filters.searchTerm
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0;
  
  // Theme-aware colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const bgSecondary = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const textMuted = isDark ? '#71717a' : '#94a3b8';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  
  return (
    <header 
      className="border-b sticky top-0 z-50 theme-transition"
      style={{ 
        background: isDark 
          ? 'linear-gradient(to right, #1a1a2e, #16213e)' 
          : 'linear-gradient(to right, #ffffff, #f8fafc)',
        borderColor 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* Top Bar: Logo + Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
                <path 
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </motion.div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span style={{ color: accentColor }}>{t('app.title')}</span>{' '}
                <span style={{ color: textPrimary }}>{t('app.subtitle')}</span>
              </h1>
              <p className="text-xs hidden sm:block" style={{ color: textSecondary }}>
                {t('app.tagline')} • <span style={{ color: textMuted }}>{t('app.unofficial')}</span>
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {dateRange.min && dateRange.max && (
              <div className="text-right hidden lg:block mr-3">
                <p className="text-xs" style={{ color: textSecondary }}>{t('header.period')}</p>
                <p className="text-sm font-medium" style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatDate(dateRange.min, language)} — {formatDate(dateRange.max, language)}
                </p>
              </div>
            )}
            
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleLanguage}
              className="flex items-center rounded-lg text-xs font-medium overflow-hidden"
              style={{ border: `1px solid ${borderColor}` }}
              title="Toggle language"
            >
              <span 
                className="px-2 py-1.5 transition-colors"
                style={{ 
                  backgroundColor: language === 'id' ? accentColor : 'transparent',
                  color: language === 'id' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                }}
              >
                ID
              </span>
              <span 
                className="px-2 py-1.5 transition-colors"
                style={{ 
                  backgroundColor: language === 'en' ? accentColor : 'transparent',
                  color: language === 'en' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                }}
              >
                EN
              </span>
            </motion.button>
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,230,0,0.1)' : 'rgba(202,138,4,0.1)',
                color: accentColor 
              }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
            
            {hasData && onClear && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClear}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ color: textSecondary }}
                title="Clear data"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
            
            {onUpload && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUpload}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ 
                  backgroundColor: bgSecondary, 
                  border: `1px solid ${borderColor}`,
                  color: textSecondary 
                }}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.upload')}</span>
              </motion.button>
            )}
            
            {hasData && onExport && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: accentColor, color: isDark ? '#0f0f0f' : '#ffffff' }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.export')}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Search Bar - Only show when there's data */}
        {hasData && (
          <>
            <div className="flex items-center gap-2">
              <SearchAutocomplete
                value={filters.searchTerm}
                onChange={(value) => updateFilters({ searchTerm: value })}
                transactions={transactions}
                placeholder={t('header.search')}
              />
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors relative"
                style={{ 
                  backgroundColor: filtersOpen || hasActiveFilters ? `${accentColor}15` : bgPrimary,
                  border: `1px solid ${filtersOpen || hasActiveFilters ? accentColor : borderColor}`,
                  color: filtersOpen || hasActiveFilters ? accentColor : textSecondary
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ 
                      backgroundColor: accentColor, 
                      color: isDark ? '#0f0f0f' : '#ffffff' 
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-2">
                {/* Date Range Dropdown */}
                <div className="relative" ref={dateDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: (filters.startDate || filters.endDate) ? `${accentColor}15` : bgPrimary,
                      border: `1px solid ${(filters.startDate || filters.endDate) ? accentColor : borderColor}`,
                      color: (filters.startDate || filters.endDate) ? accentColor : textSecondary,
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{activeDateLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {dateDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-72 rounded-xl shadow-xl z-50 overflow-hidden"
                        style={{ 
                          backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
                          border: `1px solid ${borderColor}`
                        }}
                      >
                        {/* Quick Presets */}
                        <div className="p-3 space-y-1" style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>
                            {language === 'id' ? 'Periode Cepat' : 'Quick Presets'}
                          </p>
                          <div className="grid grid-cols-2 gap-1">
                            {datePresets.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => applyPreset(preset)}
                                className="px-3 py-2 rounded-lg text-sm text-left transition-colors"
                                style={{
                                  backgroundColor: activePreset === preset.id ? accentColor : 'transparent',
                                  color: activePreset === preset.id ? (isDark ? '#0f0f0f' : '#ffffff') : textPrimary,
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Custom Date Range */}
                        <div className="p-3 space-y-3">
                          <p className="text-xs font-medium" style={{ color: textSecondary }}>
                            {language === 'id' ? 'Rentang Kustom' : 'Custom Range'}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12" style={{ color: textSecondary }}>
                                {language === 'id' ? 'Dari' : 'From'}
                              </span>
                              <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => updateFilters({ startDate: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none"
                                style={{ 
                                  backgroundColor: bgPrimary, 
                                  border: `1px solid ${borderColor}`,
                                  color: textPrimary,
                                  fontFamily: 'JetBrains Mono, monospace' 
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12" style={{ color: textSecondary }}>
                                {language === 'id' ? 'Sampai' : 'To'}
                              </span>
                              <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => updateFilters({ endDate: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none"
                                style={{ 
                                  backgroundColor: bgPrimary, 
                                  border: `1px solid ${borderColor}`,
                                  color: textPrimary,
                                  fontFamily: 'JetBrains Mono, monospace' 
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Clear dates button */}
                          {(filters.startDate || filters.endDate) && (
                            <button
                              onClick={clearDateFilters}
                              className="w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                              style={{ 
                                backgroundColor: bgPrimary,
                                color: textSecondary
                              }}
                            >
                              <X className="w-3 h-3" />
                              {language === 'id' ? 'Hapus Filter Tanggal' : 'Clear Date Filter'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Transaction Type */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: textSecondary }} />
                  <select
                    value={filters.transactionType}
                    onChange={(e) => updateFilters({ transactionType: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none min-w-[140px]"
                    style={{ 
                      backgroundColor: bgPrimary, 
                      border: `1px solid ${borderColor}`,
                      color: textPrimary
                    }}
                  >
                    <option value="">{t('header.allTypes')}</option>
                    {transactionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Reset with filter count badge */}
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetFilters}
                    className="px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    style={{ 
                      backgroundColor: `${accentColor}15`, 
                      border: `1px solid ${accentColor}`,
                      color: accentColor
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('header.reset')}</span>
                    <span 
                      className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ 
                        backgroundColor: accentColor, 
                        color: isDark ? '#0f0f0f' : '#ffffff' 
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Mobile Filters Panel */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    {/* Date Range Period Info */}
                    {dateRange.min && dateRange.max && (
                      <div 
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ backgroundColor: `${bgPrimary}80` }}
                      >
                        <span className="text-xs" style={{ color: textSecondary }}>{t('header.period')}</span>
                        <span className="text-xs font-medium" style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                          {formatDate(dateRange.min, language)} — {formatDate(dateRange.max, language)}
                        </span>
                      </div>
                    )}
                    
                    {/* Date Presets - Mobile */}
                    <div className="space-y-2">
                      <label className="text-xs" style={{ color: textSecondary }}>
                        {language === 'id' ? 'Periode Cepat' : 'Quick Presets'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {datePresets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{
                              backgroundColor: activePreset === preset.id ? accentColor : bgPrimary,
                              border: `1px solid ${activePreset === preset.id ? accentColor : borderColor}`,
                              color: activePreset === preset.id ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary,
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Date Filters */}
                    <div className="space-y-2">
                      <label className="text-xs flex items-center gap-1.5" style={{ color: textSecondary }}>
                        <Calendar className="w-3.5 h-3.5" />
                        {t('header.dateRange')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => updateFilters({ startDate: e.target.value })}
                          className="flex-1 px-3 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
                          style={{ 
                            backgroundColor: bgPrimary, 
                            border: `1px solid ${borderColor}`,
                            color: textPrimary,
                            fontFamily: 'JetBrains Mono, monospace' 
                          }}
                        />
                        <span style={{ color: textSecondary }}>—</span>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => updateFilters({ endDate: e.target.value })}
                          className="flex-1 px-3 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
                          style={{ 
                            backgroundColor: bgPrimary, 
                            border: `1px solid ${borderColor}`,
                            color: textPrimary,
                            fontFamily: 'JetBrains Mono, monospace' 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Transaction Type */}
                    <div className="space-y-2">
                      <label className="text-xs flex items-center gap-1.5" style={{ color: textSecondary }}>
                        <Filter className="w-3.5 h-3.5" />
                        {t('header.transactionType')}
                      </label>
                      <select
                        value={filters.transactionType}
                        onChange={(e) => updateFilters({ transactionType: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ 
                          backgroundColor: bgPrimary, 
                          border: `1px solid ${borderColor}`,
                          color: textPrimary
                        }}
                      >
                        <option value="">{t('header.allTypes')}</option>
                        {transactionTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          resetFilters();
                          setFiltersOpen(false);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: bgPrimary, 
                          border: `1px solid ${borderColor}`,
                          color: textSecondary
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        {t('header.reset')}
                      </button>
                      <button
                        onClick={() => setFiltersOpen(false)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: accentColor, color: isDark ? '#0f0f0f' : '#ffffff' }}
                      >
                        <X className="w-4 h-4" />
                        {t('header.close')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </header>
  );
}

function formatDate(dateStr, language = 'id') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
