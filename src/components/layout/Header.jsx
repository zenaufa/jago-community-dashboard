import { RotateCcw, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SearchAutocomplete } from '../ui/SearchAutocomplete';

export function Header({ 
  filters, 
  updateFilters, 
  resetFilters, 
  transactions = [],
  hasData = true,
  onOpenMobileMenu,
}) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Count active filters
  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.transactionType,
    filters.searchTerm
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0;
  
  // Theme-aware colors
  const bgHeader = isDark 
    ? 'linear-gradient(to right, #1a1a2e, #16213e)' 
    : 'linear-gradient(to right, #ffffff, #f8fafc)';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  
  return (
    <header 
      className="border-b sticky top-0 z-30 theme-transition"
      style={{ 
        background: bgHeader,
        borderColor 
      }}
    >
      <div className="header-content-wrapper">
        
        <div className="px-4 md:px-6 py-4">
          {/* Search Bar Row */}
          {hasData && (
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenMobileMenu}
                className="p-2 -ml-2 rounded-lg transition-colors lg:hidden"
                style={{ color: textSecondary }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
              
              {/* Search Input */}
              <div className="flex-1">
                <SearchAutocomplete
                  value={filters.searchTerm}
                  onChange={(value) => updateFilters({ searchTerm: value })}
                  transactions={transactions}
                  placeholder={t('header.search')}
                />
              </div>
              
              {/* Reset Filters Button (visible when filters active) */}
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ 
                    backgroundColor: `${accentColor}15`, 
                    border: `1px solid ${accentColor}`,
                    color: accentColor
                  }}
                  title={t('header.reset')}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('header.reset')}</span>
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
          )}
          
          {/* Empty state header for mobile */}
          {!hasData && (
            <div className="flex items-center gap-3 lg:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenMobileMenu}
                className="p-2 -ml-2 rounded-lg transition-colors"
                style={{ color: textSecondary }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
              
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{ color: accentColor }}>
                  {t('app.title')} <span style={{ color: isDark ? '#e4e4e7' : '#1e293b' }}>{t('app.subtitle')}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
