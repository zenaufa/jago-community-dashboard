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
  Menu,
  X,
  ChevronDown
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

export function MobileMenu({ 
  isOpen,
  onClose,
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
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  // Close dropdowns when menu closes
  useEffect(() => {
    if (!isOpen) {
      setDateDropdownOpen(false);
      setTypeDropdownOpen(false);
    }
  }, [isOpen]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
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
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const textMuted = isDark ? '#71717a' : '#94a3b8';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const dangerColor = '#ef4444';
  
  // Scroll to section and close menu
  const scrollToSection = (sectionId) => {
    onClose();
    setTimeout(() => {
      const element = document.querySelector(`[data-section="${sectionId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col theme-transition lg:hidden overflow-hidden"
            style={{ 
              backgroundColor: bgSidebar, 
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}
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
                  <h1 className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <span style={{ color: accentColor }}>{t('app.title')}</span>{' '}
                    <span style={{ color: textPrimary }}>{t('app.subtitle')}</span>
                  </h1>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: textSecondary }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-6">
              {/* Navigation Section */}
              {hasData && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: textMuted }}>
                    {language === 'id' ? 'Navigasi' : 'Navigation'}
                  </p>
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => scrollToSection(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                      style={{ backgroundColor: bgHover, color: textPrimary }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: accentColor }} />
                      <span className="text-sm font-medium">
                        {language === 'id' ? item.labelId : item.labelEn}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Filters Section */}
              {hasData && (
                <div className="space-y-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: textMuted }}>
                    {language === 'id' ? 'Filter' : 'Filters'}
                  </p>
                  
                  {/* Date Range */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                      style={{
                        backgroundColor: (filters.startDate || filters.endDate) ? `${accentColor}15` : bgHover,
                        border: `1px solid ${(filters.startDate || filters.endDate) ? accentColor : borderColor}`,
                        color: (filters.startDate || filters.endDate) ? accentColor : textPrimary,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">{activeDateLabel}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {dateDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="p-3 rounded-xl space-y-3"
                            style={{ backgroundColor: bgHover }}
                          >
                            {/* Presets */}
                            <div className="flex flex-wrap gap-2">
                              {datePresets.map((preset) => (
                                <button
                                  key={preset.id}
                                  onClick={() => applyPreset(preset)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: activePreset === preset.id ? accentColor : (isDark ? '#0f0f0f' : '#ffffff'),
                                    color: activePreset === preset.id ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary,
                                  }}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                            
                            {/* Custom dates */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-12" style={{ color: textSecondary }}>
                                  {language === 'id' ? 'Dari' : 'From'}
                                </span>
                                <input
                                  type="date"
                                  value={filters.startDate}
                                  onChange={(e) => updateFilters({ startDate: e.target.value })}
                                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                                  style={{ 
                                    backgroundColor: isDark ? '#0f0f0f' : '#ffffff', 
                                    border: `1px solid ${borderColor}`,
                                    color: textPrimary,
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
                                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                                  style={{ 
                                    backgroundColor: isDark ? '#0f0f0f' : '#ffffff', 
                                    border: `1px solid ${borderColor}`,
                                    color: textPrimary,
                                  }}
                                />
                              </div>
                            </div>
                            
                            {(filters.startDate || filters.endDate) && (
                              <button
                                onClick={clearDateFilters}
                                className="w-full px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                                style={{ 
                                  backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
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
                  
                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                      style={{
                        backgroundColor: filters.transactionType ? `${accentColor}15` : bgHover,
                        border: `1px solid ${filters.transactionType ? accentColor : borderColor}`,
                        color: filters.transactionType ? accentColor : textPrimary,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">
                          {filters.transactionType || (language === 'id' ? 'Semua Jenis' : 'All Types')}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {typeDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="p-2 rounded-xl space-y-1 max-h-48 overflow-y-auto"
                            style={{ backgroundColor: bgHover }}
                          >
                            <button
                              onClick={() => {
                                updateFilters({ transactionType: '' });
                                setTypeDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
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
                                className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
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
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: textMuted }}>
                  {language === 'id' ? 'Aksi' : 'Actions'}
                </p>
                
                {onUpload && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onUpload(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: bgHover, color: textPrimary }}
                  >
                    <Upload className="w-5 h-5" style={{ color: textSecondary }} />
                    <span className="text-sm font-medium">{t('header.upload')}</span>
                  </motion.button>
                )}
                
                {hasData && onExport && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onExport(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('header.export')}</span>
                  </motion.button>
                )}
                
                {hasData && onClear && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onClear(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: dangerColor }}
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{language === 'id' ? 'Hapus Data' : 'Clear Data'}</span>
                  </motion.button>
                )}
              </div>

              {/* Data Period Display */}
              {hasData && dateRange.min && dateRange.max && (
                <div 
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: isDark ? '#0f0f0f' : '#f1f5f9' }}
                >
                  <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: textMuted }}>
                    {t('header.period')}
                  </p>
                  <p className="text-sm font-medium" style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatDate(dateRange.min, language)} — {formatDate(dateRange.max, language)}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section: Language & Theme */}
            <div 
              className="flex-shrink-0 p-4 space-y-3"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="flex-1 flex items-center justify-center rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  <span 
                    className="flex-1 py-2.5 text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: language === 'id' ? accentColor : 'transparent',
                      color: language === 'id' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                    }}
                  >
                    ID
                  </span>
                  <span 
                    className="flex-1 py-2.5 text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: language === 'en' ? accentColor : 'transparent',
                      color: language === 'en' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                    }}
                  >
                    EN
                  </span>
                </button>
              </div>
              
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,230,0,0.1)' : 'rgba(202,138,4,0.1)',
                  color: accentColor 
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {isDark ? (language === 'id' ? 'Mode Terang' : 'Light Mode') : (language === 'id' ? 'Mode Gelap' : 'Dark Mode')}
                </span>
              </motion.button>
              
              {/* Copyright */}
              <div className="pt-2 text-center">
                <p className="text-xs" style={{ color: textMuted }}>
                  © 2025 <a href="https://github.com/Linaqruf" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: textSecondary }}>Linaqruf</a>
                </p>
                <p className="text-[10px]" style={{ color: textMuted }}>Licensed under Apache 2.0</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Hamburger button component to trigger the mobile menu
export function MobileMenuTrigger({ onClick }) {
  const { isDark } = useTheme();
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg transition-colors lg:hidden"
      style={{ color: textSecondary }}
    >
      <Menu className="w-6 h-6" />
    </motion.button>
  );
}

