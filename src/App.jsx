import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTransactionData } from './hooks/useTransactionData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import { MobileMenu } from './components/layout/MobileMenu';
import { Header } from './components/layout/Header';
import { SummaryCards } from './components/SummaryCards';
import { TrendChart } from './components/TrendChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { TransactionTable } from './components/TransactionTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EmptyState } from './components/EmptyState';
import { PeriodComparison } from './components/analytics/PeriodComparison';
import { ExportModal } from './components/modals/ExportModal';
import { UploadModal } from './components/modals/UploadModal';
import { CategoryRulesModal } from './components/modals/CategoryRulesModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { AlertTriangle } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { BackToTop } from './components/ui/BackToTop';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Custom hook for localStorage persistence
function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore localStorage errors
    }
  }, [key, state]);

  return [state, setState];
}

function App() {
  const [isHidden, setIsHidden] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [categoryRulesModalOpen, setCategoryRulesModalOpen] = useState(false);
  const [confirmClearModalOpen, setConfirmClearModalOpen] = useState(false);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorageState('sidebar-collapsed', false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const chartRef = useRef(null);
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f8fafc';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const textMuted = isDark ? '#71717a' : '#94a3b8';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  
  const {
    loading,
    error,
    hasData,
    transactions,
    summary,
    monthlyTrend,
    categoryBreakdown,
    topMerchants,
    allMerchants,
    transactionTypes,
    dateRange,
    filters,
    updateFilters,
    resetFilters,
    loadFromFile,
    clearData,
  } = useTransactionData();

  // Keyboard shortcuts
  const anyModalOpen = exportModalOpen || uploadModalOpen || categoryRulesModalOpen || confirmClearModalOpen || mobileMenuOpen;
  
  const shortcuts = useMemo(() => ({
    'mod+k': () => {
      if (!hasData) return;
      const searchInput = document.querySelector('input[placeholder*="transaksi"], input[placeholder*="transaction"]');
      if (searchInput) {
        searchInput.focus();
        showToast({ message: t('footer.search') + ' (⌘K)', type: 'info', duration: 1500 });
      }
    },
    'mod+e': () => {
      if (!anyModalOpen && hasData) {
        setExportModalOpen(true);
      }
    },
    'mod+u': () => {
      if (!anyModalOpen) {
        setUploadModalOpen(true);
      }
    },
    'mod+h': () => {
      if (!hasData) return;
      setIsHidden(prev => !prev);
      showToast({ 
        message: isHidden ? 'Values shown' : t('footer.hide'), 
        type: 'info', 
        duration: 1500 
      });
    },
    'mod+b': () => {
      // Toggle sidebar on desktop
      setSidebarCollapsed(prev => !prev);
    },
    'escape': () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (exportModalOpen) setExportModalOpen(false);
      if (uploadModalOpen) setUploadModalOpen(false);
      if (categoryRulesModalOpen) setCategoryRulesModalOpen(false);
      if (confirmClearModalOpen) setConfirmClearModalOpen(false);
    },
  }), [anyModalOpen, isHidden, showToast, exportModalOpen, uploadModalOpen, categoryRulesModalOpen, confirmClearModalOpen, mobileMenuOpen, hasData, t, setSidebarCollapsed]);

  useKeyboardShortcuts(shortcuts, !loading);

  // Handle file upload from EmptyState
  const handleFileUpload = async (file) => {
    await loadFromFile(file);
    showToast({ message: t('common.dataLoaded'), type: 'success' });
  };

  // Handle clear data - show confirmation modal
  const handleClearDataClick = () => {
    setConfirmClearModalOpen(true);
  };

  // Actually clear data after confirmation
  const handleConfirmClearData = () => {
    clearData();
    showToast({ message: t('common.dataCleared'), type: 'info' });
  };

  // Sidebar width for content offset
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show empty state if no data
  if (!hasData) {
    return (
      <>
        <EmptyState 
          onUpload={handleFileUpload}
        />
        {/* Mobile Menu for empty state */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          filters={filters}
          updateFilters={updateFilters}
          resetFilters={resetFilters}
          dateRange={dateRange}
          transactionTypes={transactionTypes}
          hasData={false}
          onUpload={() => setUploadModalOpen(true)}
          onExport={null}
          onClear={null}
        />
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={async (csvText) => {
            const blob = new Blob([csvText], { type: 'text/csv' });
            const file = new File([blob], 'uploaded.csv', { type: 'text/csv' });
            await loadFromFile(file);
            showToast({ message: t('common.dataLoaded'), type: 'success' });
            setUploadModalOpen(false);
          }}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-transition" style={{ backgroundColor: bgPrimary }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: isDark ? '#e4e4e7' : '#1e293b' }}>
            {t('common.error')}
          </h2>
          <p className="text-sm" style={{ color: textSecondary }}>{error}</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: accentColor, color: isDark ? '#0f0f0f' : '#ffffff' }}
          >
            {t('common.retry')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-transition" style={{ backgroundColor: bgPrimary }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" 
             style={{ backgroundColor: `${accentColor}08` }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl"
             style={{ backgroundColor: isDark ? 'rgba(167, 139, 250, 0.05)' : 'rgba(124, 58, 237, 0.03)' }} />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full blur-3xl"
             style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.03)' }} />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: isDark 
              ? `linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)`
              : `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            opacity: 0.02,
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        dateRange={dateRange}
        transactionTypes={transactionTypes}
        hasData={hasData}
        onUpload={() => setUploadModalOpen(true)}
        onExport={() => setExportModalOpen(true)}
        onClear={handleClearDataClick}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        dateRange={dateRange}
        transactionTypes={transactionTypes}
        hasData={hasData}
        onUpload={() => setUploadModalOpen(true)}
        onExport={() => setExportModalOpen(true)}
        onClear={handleClearDataClick}
      />

      {/* Main Content Area */}
      <div className="relative z-10">
        {/* Dynamic sidebar offset styles */}
        <style>{`
          @media (min-width: 1024px) {
            .main-content-wrapper {
              margin-left: ${sidebarWidth}px;
              transition: margin-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
          }
          @media (max-width: 1023px) {
            .main-content-wrapper {
              margin-left: 0 !important;
            }
          }
        `}</style>
        
        <div className="main-content-wrapper">
          {/* Compact Header with Search */}
          <Header 
            filters={filters}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
            transactions={transactions}
            hasData={hasData}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          <motion.main 
            className="px-4 md:px-6 py-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Summary Cards */}
            <motion.section variants={itemVariants} data-section="overview">
              <SummaryCards 
                summary={summary} 
                isHidden={isHidden}
                onToggleHidden={() => setIsHidden(!isHidden)}
              />
            </motion.section>

            {/* Trend Chart */}
            <motion.section variants={itemVariants} data-section="chart">
              <div ref={chartRef}>
                <TrendChart 
                  data={monthlyTrend} 
                  searchKeyword={filters.searchTerm}
                  summary={summary}
                  isHidden={isHidden}
                  skipEmptyPeriods={filters.skipEmptyPeriods}
                  onToggleSkipEmpty={() => updateFilters({ skipEmptyPeriods: !filters.skipEmptyPeriods })}
                />
              </div>
            </motion.section>

            {/* Analytics Row */}
            <motion.section variants={itemVariants} data-section="analytics">
              <PeriodComparison 
                transactions={transactions}
                isHidden={isHidden}
              />
            </motion.section>

            {/* Category Breakdown */}
            <motion.section variants={itemVariants} data-section="categories">
              <CategoryBreakdown 
                categoryData={categoryBreakdown}
                topMerchants={topMerchants}
                allMerchants={allMerchants}
                isHidden={isHidden}
                onOpenCategoryRules={() => setCategoryRulesModalOpen(true)}
                onSelectMerchant={(merchantName) => {
                  updateFilters({ searchTerm: merchantName });
                  // Scroll to transaction table
                  setTimeout(() => {
                    const tableSection = document.querySelector('[data-section="transactions"]');
                    tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                  showToast({ 
                    message: `${t('footer.search')}: ${merchantName}`, 
                    type: 'info', 
                    duration: 2000 
                  });
                }}
              />
            </motion.section>

            {/* Transaction Table */}
            <motion.section variants={itemVariants} data-section="transactions">
              <TransactionTable transactions={transactions} isHidden={isHidden} />
            </motion.section>
          </motion.main>

          {/* Footer */}
          <footer className="mt-8 theme-transition" style={{ borderTop: `1px solid ${borderColor}` }}>
            <div className="px-4 md:px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm" style={{ color: accentColor }}>{t('app.title')}</span>
                    <span className="text-sm" style={{ color: textSecondary }}> {t('app.subtitle')}</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Keyboard shortcuts hint */}
                  <div className="hidden lg:flex items-center gap-2 text-xs" style={{ color: textSecondary }}>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: borderColor }}>⌘K</span>
                    <span>{t('footer.search')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: borderColor }}>⌘B</span>
                    <span>Sidebar</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: borderColor }}>⌘E</span>
                    <span>Export</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: borderColor }}>⌘H</span>
                    <span>{t('footer.hide')}</span>
                  </div>
                  
                  <p className="text-xs text-center md:text-right" style={{ color: textMuted }}>
                    {t('footer.disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        transactions={transactions}
        summary={summary}
        categoryData={categoryBreakdown}
        topMerchants={topMerchants}
        dateRange={dateRange}
        chartRef={chartRef.current}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={async (csvText) => {
          const blob = new Blob([csvText], { type: 'text/csv' });
          const file = new File([blob], 'uploaded.csv', { type: 'text/csv' });
          await loadFromFile(file);
          showToast({ message: t('common.dataLoaded'), type: 'success' });
          setUploadModalOpen(false);
        }}
      />

      <CategoryRulesModal
        isOpen={categoryRulesModalOpen}
        onClose={() => setCategoryRulesModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmClearModalOpen}
        onClose={() => setConfirmClearModalOpen(false)}
        onConfirm={handleConfirmClearData}
        title={t('common.dataCleared') === 'Data dihapus' ? 'Hapus Data' : 'Clear Data'}
        message={t('common.dataCleared') === 'Data dihapus' 
          ? 'Apakah Anda yakin ingin menghapus semua data transaksi? Tindakan ini tidak dapat dibatalkan.'
          : 'Are you sure you want to clear all transaction data? This action cannot be undone.'}
        confirmText={t('common.dataCleared') === 'Data dihapus' ? 'Ya, Hapus' : 'Yes, Clear'}
        cancelText={t('common.dataCleared') === 'Data dihapus' ? 'Batal' : 'Cancel'}
        variant="danger"
      />

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}

export default App;
