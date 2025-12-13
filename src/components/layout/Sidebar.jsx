import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Receipt,
  Calendar, 
  Filter, 
  Upload, 
  Download, 
  Trash2, 
  Sun, 
  Moon, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Format date to YYYY-MM-DD using local time
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
  
  const today = new Date(year, month, day);
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);
  const last30Start = new Date(year, month, day - 29);
  const last3MonthsStart = new Date(year, month - 2, 1);
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

function formatDate(dateStr, language = 'id') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Navigation items for scrolling to sections
const navItems = [
  { id: 'overview', icon: LayoutDashboard, labelEn: 'Overview', labelId: 'Ringkasan' },
  { id: 'chart', icon: TrendingUp, labelEn: 'Trend Chart', labelId: 'Grafik Tren' },
  { id: 'analytics', icon: BarChart3, labelEn: 'Analytics', labelId: 'Analitik' },
  { id: 'categories', icon: PieChart, labelEn: 'Categories', labelId: 'Kategori' },
  { id: 'transactions', icon: Receipt, labelEn: 'Transactions', labelId: 'Transaksi' },
];

export function Sidebar({ 
  isCollapsed, 
  onToggleCollapse,
  filters, 
  updateFilters, 
  resetFilters, 
  dateRange, 
  transactionTypes,
  hasData = true,
  onUpload,
  onExport,
  onClear,
}) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const dateDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
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
      return language === 'id' ? 'Kustom' : 'Custom';
    }
    return language === 'id' ? 'Semua' : 'All Time';
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
  
  // Theme-aware colors
  const bgSidebar = isDark ? '#1a1a2e' : '#ffffff';
  const bgHover = isDark ? '#2a2a4e' : '#f1f5f9';
  const bgActive = isDark ? '#2a2a4e' : '#fef3c7';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const textMuted = isDark ? '#71717a' : '#94a3b8';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const dangerColor = '#ef4444';
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sidebarWidth = isCollapsed ? 72 : 260;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 theme-transition overflow-hidden"
      style={{ 
        backgroundColor: bgSidebar, 
        borderRight: `1px solid ${borderColor}`,
        width: sidebarWidth,
      }}
    >
      {/* Logo Section */}
      <div 
        className="flex items-center gap-3 p-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <motion.div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span style={{ color: accentColor }}>{t('app.title')}</span>{' '}
                <span style={{ color: textPrimary }}>{t('app.subtitle')}</span>
              </h1>
              <p className="text-[10px] whitespace-nowrap" style={{ color: textMuted }}>
                {t('app.unofficial')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <div className="px-3 py-2 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: bgHover, color: textSecondary }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">{language === 'id' ? 'Ciutkan' : 'Collapse'}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-4">
        {/* Navigation Section */}
        {hasData && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-[10px] font-medium uppercase tracking-wider px-3 mb-2" style={{ color: textMuted }}>
                {language === 'id' ? 'Navigasi' : 'Navigation'}
              </p>
            )}
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                style={{ color: textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title={isCollapsed ? (language === 'id' ? item.labelId : item.labelEn) : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap">
                    {language === 'id' ? item.labelId : item.labelEn}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Filters Section */}
        {hasData && (
          <div className="space-y-2">
            {!isCollapsed && (
              <p className="text-[10px] font-medium uppercase tracking-wider px-3 mb-2" style={{ color: textMuted }}>
                {language === 'id' ? 'Filter' : 'Filters'}
              </p>
            )}
            
            {/* Date Range Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: (filters.startDate || filters.endDate) ? `${accentColor}15` : 'transparent',
                  border: `1px solid ${(filters.startDate || filters.endDate) ? accentColor : borderColor}`,
                  color: (filters.startDate || filters.endDate) ? accentColor : textSecondary,
                }}
                title={isCollapsed ? (language === 'id' ? 'Filter Tanggal' : 'Date Filter') : undefined}
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{activeDateLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.button>
              
              <AnimatePresence>
                {dateDropdownOpen && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden"
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
                      <div className="space-y-1">
                        {datePresets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
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
                          <span className="text-xs w-10" style={{ color: textSecondary }}>
                            {language === 'id' ? 'Dari' : 'From'}
                          </span>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => updateFilters({ startDate: e.target.value })}
                            className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors focus:outline-none"
                            style={{ 
                              backgroundColor: isDark ? '#0f0f0f' : '#f1f5f9', 
                              border: `1px solid ${borderColor}`,
                              color: textPrimary,
                              fontFamily: 'JetBrains Mono, monospace' 
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-10" style={{ color: textSecondary }}>
                            {language === 'id' ? 'Sampai' : 'To'}
                          </span>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => updateFilters({ endDate: e.target.value })}
                            className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors focus:outline-none"
                            style={{ 
                              backgroundColor: isDark ? '#0f0f0f' : '#f1f5f9', 
                              border: `1px solid ${borderColor}`,
                              color: textPrimary,
                              fontFamily: 'JetBrains Mono, monospace' 
                            }}
                          />
                        </div>
                      </div>
                      
                      {(filters.startDate || filters.endDate) && (
                        <button
                          onClick={clearDateFilters}
                          className="w-full px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                          style={{ 
                            backgroundColor: isDark ? '#0f0f0f' : '#f1f5f9',
                            color: textSecondary
                          }}
                        >
                          <X className="w-3 h-3" />
                          {language === 'id' ? 'Hapus Filter' : 'Clear Filter'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Transaction Type Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: filters.transactionType ? `${accentColor}15` : 'transparent',
                  border: `1px solid ${filters.transactionType ? accentColor : borderColor}`,
                  color: filters.transactionType ? accentColor : textSecondary,
                }}
                title={isCollapsed ? (language === 'id' ? 'Jenis Transaksi' : 'Transaction Type') : undefined}
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">
                      {filters.transactionType || (language === 'id' ? 'Semua Jenis' : 'All Types')}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${typeDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.button>
              
              <AnimatePresence>
                {typeDropdownOpen && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto"
                    style={{ 
                      backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          updateFilters({ transactionType: '' });
                          setTypeDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        style={{
                          backgroundColor: !filters.transactionType ? accentColor : 'transparent',
                          color: !filters.transactionType ? (isDark ? '#0f0f0f' : '#ffffff') : textPrimary,
                        }}
                      >
                        {language === 'id' ? 'Semua Jenis' : 'All Types'}
                      </button>
                      {transactionTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            updateFilters({ transactionType: type });
                            setTypeDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                          style={{
                            backgroundColor: filters.transactionType === type ? accentColor : 'transparent',
                            color: filters.transactionType === type ? (isDark ? '#0f0f0f' : '#ffffff') : textPrimary,
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-medium uppercase tracking-wider px-3 mb-2" style={{ color: textMuted }}>
              {language === 'id' ? 'Aksi' : 'Actions'}
            </p>
          )}
          
          {onUpload && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUpload}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{ color: textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={isCollapsed ? 'Upload' : undefined}
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{t('header.upload')}</span>}
            </motion.button>
          )}
          
          {hasData && onExport && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExport}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{ color: accentColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accentColor}15`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={isCollapsed ? 'Export' : undefined}
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t('header.export')}</span>}
            </motion.button>
          )}
          
          {hasData && onClear && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClear}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{ color: dangerColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={isCollapsed ? (language === 'id' ? 'Hapus Data' : 'Clear Data') : undefined}
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{language === 'id' ? 'Hapus Data' : 'Clear Data'}</span>}
            </motion.button>
          )}
        </div>

        {/* Data Period Display */}
        {hasData && dateRange.min && dateRange.max && !isCollapsed && (
          <div 
            className="mx-0 p-3 rounded-lg"
            style={{ backgroundColor: isDark ? '#0f0f0f' : '#f1f5f9' }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: textMuted }}>
              {t('header.period')}
            </p>
            <p className="text-xs font-medium" style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
              {formatDate(dateRange.min, language)}
            </p>
            <p className="text-[10px]" style={{ color: textMuted }}>—</p>
            <p className="text-xs font-medium" style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
              {formatDate(dateRange.max, language)}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section: Language & Theme */}
      <div 
        className="flex-shrink-0 p-3 space-y-2"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        {/* Language Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleLanguage}
          className="w-full flex items-center justify-center rounded-lg overflow-hidden"
          style={{ border: `1px solid ${borderColor}` }}
          title={isCollapsed ? 'Toggle language' : undefined}
        >
          <span 
            className={`flex-1 py-2 text-xs font-medium transition-colors ${isCollapsed ? 'px-1' : 'px-3'}`}
            style={{ 
              backgroundColor: language === 'id' ? accentColor : 'transparent',
              color: language === 'id' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
            }}
          >
            ID
          </span>
          <span 
            className={`flex-1 py-2 text-xs font-medium transition-colors ${isCollapsed ? 'px-1' : 'px-3'}`}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,230,0,0.1)' : 'rgba(202,138,4,0.1)',
            color: accentColor 
          }}
          title={isCollapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
        >
          {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {!isCollapsed && (
            <span className="text-sm">
              {isDark ? (language === 'id' ? 'Mode Terang' : 'Light Mode') : (language === 'id' ? 'Mode Gelap' : 'Dark Mode')}
            </span>
          )}
        </motion.button>
        
        {/* Copyright */}
        {!isCollapsed && (
          <div className="pt-2 text-center">
            <p className="text-[10px]" style={{ color: textMuted }}>
              © 2025 <a href="https://github.com/Linaqruf" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: textSecondary }}>Linaqruf</a>
            </p>
            <p className="text-[9px]" style={{ color: textMuted }}>Apache 2.0</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

