import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  ExternalLink,
  Search,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber } from '../utils/dataProcessor';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { TransactionDetailModal } from './modals/TransactionDetailModal';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function TransactionTable({ transactions, isHidden }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'desc' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [inlineSearch, setInlineSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [goToPageValue, setGoToPageValue] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);
  const rowRefs = useRef([]);
  const searchInputRef = useRef(null);
  
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  // Theme colors
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const bgDarker = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter transactions by inline search and quick filter
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Apply quick filter
    if (quickFilter === 'income') {
      result = result.filter(tx => tx.amount >= 0);
    } else if (quickFilter === 'expense') {
      result = result.filter(tx => tx.amount < 0);
    }
    
    // Apply inline search
    if (inlineSearch.trim()) {
      const searchLower = inlineSearch.toLowerCase();
      result = result.filter(tx => 
        (tx.source && tx.source.toLowerCase().includes(searchLower)) ||
        (tx.type && tx.type.toLowerCase().includes(searchLower)) ||
        (tx.transaction_id && tx.transaction_id.toLowerCase().includes(searchLower))
      );
    }
    
    return result;
  }, [transactions, quickFilter, inlineSearch]);

  // Sorted transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'amount' || sortConfig.key === 'balance') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTransactions, sortConfig]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFocusedRowIndex(-1);
  }, [inlineSearch, quickFilter, itemsPerPage]);

  // Announce changes for screen readers
  const announce = useCallback((message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => {
      const newDirection = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      announce(`Sorted by ${key}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`);
      return { key, direction: newDirection };
    });
  };

  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    setFocusedRowIndex(-1);
    announce(`Page ${newPage} of ${totalPages}`);
  }, [totalPages, announce]);

  const handleGoToPageSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(goToPageValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
      setGoToPageValue('');
    }
  };

  // Keyboard navigation handler
  const handleTableKeyDown = useCallback((e) => {
    const rowCount = paginatedTransactions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedRowIndex(prev => {
          const next = prev < rowCount - 1 ? prev + 1 : prev;
          rowRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedRowIndex(prev => {
          const next = prev > 0 ? prev - 1 : 0;
          rowRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'Enter':
        if (focusedRowIndex >= 0 && focusedRowIndex < rowCount) {
          setSelectedTransaction(paginatedTransactions[focusedRowIndex]);
        }
        break;
      case 'Escape':
        setFocusedRowIndex(-1);
        tableRef.current?.blur();
        break;
      case 'PageDown':
        e.preventDefault();
        if (currentPage < totalPages) {
          goToPage(currentPage + 1);
        }
        break;
      case 'PageUp':
        e.preventDefault();
        if (currentPage > 1) {
          goToPage(currentPage - 1);
        }
        break;
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          goToPage(1);
        }
        break;
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          goToPage(totalPages);
        }
        break;
    }
  }, [paginatedTransactions, focusedRowIndex, currentPage, totalPages, goToPage]);

  const SortIcon = ({ column }) => {
    const isSorted = sortConfig.key === column;
    if (!isSorted) {
      return <ArrowUpDown className="w-3 h-3" style={{ color: textSecondary }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3" style={{ color: accentColor }} />
      : <ArrowDown className="w-3 h-3" style={{ color: accentColor }} />;
  };

  const getAriaSort = (column) => {
    if (sortConfig.key !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Quick filter button component
  const QuickFilterButton = ({ value, label, icon: Icon }) => {
    const isActive = quickFilter === value;
    return (
      <button
        onClick={() => setQuickFilter(value)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: isActive ? `${accentColor}20` : 'transparent',
          color: isActive ? accentColor : textSecondary,
          border: `1px solid ${isActive ? accentColor : borderColor}`,
        }}
        aria-pressed={isActive}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </button>
    );
  };

  // Mobile card component
  const TransactionCard = ({ tx, index }) => {
    const isIncome = tx.amount >= 0;
    
    const handleCardClick = (e) => {
      // Prevent double-firing on touch devices
      e.stopPropagation();
      setSelectedTransaction(tx);
    };
    
    return (
      <motion.div
        ref={el => rowRefs.current[index] = el}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        tabIndex={0}
        role="button"
        aria-label={`${tx.source || 'Transaction'}, ${isIncome ? 'income' : 'expense'} ${formatCurrency(Math.abs(tx.amount))}`}
        onClick={handleCardClick}
        onTouchEnd={(e) => {
          // Handle touch immediately without waiting for click
          e.preventDefault();
          setSelectedTransaction(tx);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedTransaction(tx);
          }
        }}
        className="p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${borderColor}`,
          opacity: tx.isReversal ? 0.5 : 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-md" 
                style={{ 
                  backgroundColor: tx.isReversal ? 'rgba(245, 158, 11, 0.1)' : `${accentColor}15`,
                  color: tx.isReversal ? '#f59e0b' : accentColor
                }}>
                {tx.type}
              </span>
              <span className="text-xs font-mono" style={{ color: textSecondary }}>
                {formatShortDate(tx.datetime)}
              </span>
            </div>
            <p className="text-sm font-medium truncate" style={{ color: textPrimary }} title={tx.source}>
              {tx.source || '-'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p 
              className={`text-sm font-mono font-semibold ${isHidden ? 'blur-sm select-none' : ''}`}
              style={{ color: isIncome ? '#10b981' : '#ef4444' }}
            >
              {isHidden ? 'Rp •••' : `${isIncome ? '+' : ''}${formatCurrency(tx.amount)}`}
            </p>
            <p className={`text-xs font-mono ${isHidden ? 'blur-sm select-none' : ''}`} style={{ color: textSecondary }}>
              {isHidden ? 'Rp •••' : formatCurrency(tx.balance)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ 
        background: isDark 
          ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)' 
          : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
        border: `1px solid ${borderColor}` 
      }}
    >
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        {announcement}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-5 py-4 gap-2"
           style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Receipt className="w-4 h-4" style={{ color: '#f59e0b' }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
              {t('table.title')}
            </h3>
            <p className="text-xs" style={{ color: textSecondary }}>
              {language === 'id' ? 'Menampilkan' : 'Showing'} {formatNumber(sortedTransactions.length)} {language === 'id' ? 'transaksi' : 'transactions'}
              {inlineSearch && ` (${language === 'id' ? 'difilter' : 'filtered'})`}
            </p>
          </div>
        </div>
        
        <div className="text-sm" style={{ color: textSecondary }}>
          {language === 'id' ? 'Halaman' : 'Page'} <span className="font-mono" style={{ color: accentColor }}>{currentPage}</span> {language === 'id' ? 'dari' : 'of'}{' '}
          <span className="font-mono" style={{ color: textPrimary }}>{totalPages || 1}</span>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div 
        className="px-4 md:px-5 py-3 flex flex-col sm:flex-row gap-3"
        style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: `${bgDarker}50` }}
      >
        {/* Inline Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={language === 'id' ? 'Cari transaksi...' : 'Search transactions...'}
            value={inlineSearch}
            onChange={(e) => setInlineSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-lg text-sm transition-colors focus:outline-none"
            style={{ 
              backgroundColor: bgDarker, 
              border: `1px solid ${borderColor}`,
              color: textPrimary,
            }}
            aria-label={language === 'id' ? 'Cari transaksi' : 'Search transactions'}
          />
          {inlineSearch && (
            <button
              onClick={() => setInlineSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70"
              style={{ color: textSecondary }}
              aria-label={language === 'id' ? 'Hapus pencarian' : 'Clear search'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2" role="group" aria-label={language === 'id' ? 'Filter cepat' : 'Quick filters'}>
          <Filter className="w-4 h-4 hidden sm:block" style={{ color: textSecondary }} aria-hidden="true" />
          <QuickFilterButton value="all" label={language === 'id' ? 'Semua' : 'All'} />
          <QuickFilterButton value="income" label={language === 'id' ? 'Masuk' : 'Income'} icon={ArrowUpRight} />
          <QuickFilterButton value="expense" label={language === 'id' ? 'Keluar' : 'Expense'} icon={ArrowDownRight} />
        </div>

        {/* Items Per Page */}
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-xs whitespace-nowrap" style={{ color: textSecondary }}>
            {language === 'id' ? 'Per halaman:' : 'Per page:'}
          </label>
          <div className="relative">
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-sm cursor-pointer focus:outline-none"
              style={{ 
                backgroundColor: bgDarker, 
                border: `1px solid ${borderColor}`,
                color: textPrimary,
              }}
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" 
              style={{ color: textSecondary }} 
            />
          </div>
        </div>
      </div>

      {/* Table / Cards Container */}
      <div 
        ref={tableContainerRef}
        className="overflow-x-auto max-h-[600px] overflow-y-auto"
        onKeyDown={handleTableKeyDown}
        tabIndex={-1}
      >
        {/* Desktop Table View */}
        {!isMobile ? (
          <table 
            ref={tableRef}
            className="w-full"
            role="grid"
            aria-label={language === 'id' ? 'Daftar transaksi' : 'Transaction list'}
            aria-rowcount={sortedTransactions.length}
          >
            <thead className="sticky top-0 z-10">
              <tr 
                style={{ 
                  backgroundColor: bgDarker,
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 1px 0 ${borderColor}`,
                }}
                role="row"
              >
                <th className="px-4 py-3 text-left" role="columnheader" aria-sort={getAriaSort('datetime')}>
                  <button 
                    onClick={() => handleSort('datetime')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: textSecondary }}
                    aria-label={`${t('table.date')}, ${language === 'id' ? 'klik untuk urutkan' : 'click to sort'}`}
                  >
                    {t('table.date')} <SortIcon column="datetime" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left" role="columnheader" aria-sort={getAriaSort('source')}>
                  <button 
                    onClick={() => handleSort('source')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: textSecondary }}
                    aria-label={`${t('table.source')}, ${language === 'id' ? 'klik untuk urutkan' : 'click to sort'}`}
                  >
                    {t('table.source')} <SortIcon column="source" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left" role="columnheader" aria-sort={getAriaSort('type')}>
                  <button 
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: textSecondary }}
                    aria-label={`${t('table.type')}, ${language === 'id' ? 'klik untuk urutkan' : 'click to sort'}`}
                  >
                    {t('table.type')} <SortIcon column="type" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right" role="columnheader" aria-sort={getAriaSort('amount')}>
                  <button 
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors ml-auto hover:opacity-80"
                    style={{ color: textSecondary }}
                    aria-label={`${t('table.amount')}, ${language === 'id' ? 'klik untuk urutkan' : 'click to sort'}`}
                  >
                    {t('table.amount')} <SortIcon column="amount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right" role="columnheader" aria-sort={getAriaSort('balance')}>
                  <button 
                    onClick={() => handleSort('balance')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors ml-auto hover:opacity-80"
                    style={{ color: textSecondary }}
                    aria-label={`${t('table.balance')}, ${language === 'id' ? 'klik untuk urutkan' : 'click to sort'}`}
                  >
                    {t('table.balance')} <SortIcon column="balance" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr role="row">
                  <td colSpan={5} className="px-4 py-12 text-center" role="gridcell">
                    <p className="text-sm" style={{ color: textSecondary }}>
                      {language === 'id' ? 'Tidak ada transaksi ditemukan' : 'No transactions found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, index) => {
                  const isFocused = focusedRowIndex === index;
                  return (
                    <motion.tr 
                      key={tx.transaction_id || index}
                      ref={el => rowRefs.current[index] = el}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      role="row"
                      aria-rowindex={startIndex + index + 1}
                      tabIndex={isFocused ? 0 : -1}
                      className="transition-colors cursor-pointer group"
                      style={{ 
                        borderTop: `1px solid ${borderColor}50`,
                        opacity: tx.isReversal ? 0.5 : 1,
                        backgroundColor: isFocused ? `${accentColor}15` : 'transparent',
                        outline: isFocused ? `2px solid ${accentColor}` : 'none',
                        outlineOffset: '-2px',
                      }}
                      onClick={() => setSelectedTransaction(tx)}
                      onFocus={() => setFocusedRowIndex(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTransaction(tx);
                        }
                      }}
                      whileHover={{ backgroundColor: `${accentColor}08` }}
                    >
                      <td className="px-4 py-3" role="gridcell">
                        <span className="text-sm font-mono" style={{ color: textSecondary }}>
                          {formatDateTime(tx.datetime)}
                        </span>
                      </td>
                      <td className="px-4 py-3" role="gridcell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm max-w-[200px] truncate block" style={{ color: textPrimary }} title={tx.source}>
                            {tx.source || '-'}
                          </span>
                          <ExternalLink 
                            className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                            style={{ color: accentColor }}
                            aria-hidden="true"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3" role="gridcell">
                        <span 
                          className="text-xs px-2 py-1 rounded-md inline-block"
                          style={{
                            backgroundColor: tx.isReversal ? 'rgba(245, 158, 11, 0.1)' : `${accentColor}15`,
                            color: tx.isReversal ? '#f59e0b' : accentColor
                          }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" role="gridcell">
                        <span 
                          className={`text-sm font-mono font-medium ${isHidden ? 'blur-sm select-none' : ''}`}
                          style={{ color: tx.amount >= 0 ? '#10b981' : '#ef4444' }}
                        >
                          {isHidden ? 'Rp •••••••' : `${tx.amount >= 0 ? '+' : ''}${formatCurrency(tx.amount)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" role="gridcell">
                        <span className={`text-sm font-mono ${isHidden ? 'blur-sm select-none' : ''}`} style={{ color: textSecondary }}>
                          {isHidden ? 'Rp •••••••' : formatCurrency(tx.balance)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          /* Mobile Card View */
          <div className="p-4 space-y-3" role="list" aria-label={language === 'id' ? 'Daftar transaksi' : 'Transaction list'}>
            {paginatedTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: textSecondary }}>
                  {language === 'id' ? 'Tidak ada transaksi ditemukan' : 'No transactions found'}
                </p>
              </div>
            ) : (
              paginatedTransactions.map((tx, index) => (
                <TransactionCard key={tx.transaction_id || index} tx={tx} index={index} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      <div 
        className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-5 py-4 gap-3"
        style={{ borderTop: `1px solid ${borderColor}` }}
        role="navigation"
        aria-label={language === 'id' ? 'Navigasi halaman' : 'Page navigation'}
      >
        <div className="text-sm order-2 sm:order-1 flex items-center gap-3" style={{ color: textSecondary }}>
          <span>
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedTransactions.length)} {language === 'id' ? 'dari' : 'of'} {formatNumber(sortedTransactions.length)}
          </span>
          
          {/* Keyboard hints */}
          <span className="hidden lg:flex items-center gap-1 text-xs" style={{ color: textSecondary }}>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: borderColor }}>↑↓</kbd>
            <span>{language === 'id' ? 'navigasi' : 'navigate'}</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono ml-2" style={{ backgroundColor: borderColor }}>PgUp/Dn</kbd>
            <span>{language === 'id' ? 'halaman' : 'page'}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Go to page form */}
          <form onSubmit={handleGoToPageSubmit} className="hidden sm:flex items-center gap-1.5">
            <label htmlFor="go-to-page" className="text-xs" style={{ color: textSecondary }}>
              {language === 'id' ? 'Ke:' : 'Go:'}
            </label>
            <input
              id="go-to-page"
              type="number"
              min={1}
              max={totalPages}
              value={goToPageValue}
              onChange={(e) => setGoToPageValue(e.target.value)}
              placeholder="#"
              className="w-12 px-2 py-1 rounded text-sm text-center focus:outline-none"
              style={{ 
                backgroundColor: bgDarker, 
                border: `1px solid ${borderColor}`,
                color: textPrimary,
              }}
              aria-label={language === 'id' ? 'Nomor halaman' : 'Page number'}
            />
          </form>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: textPrimary }}
              aria-label={language === 'id' ? 'Halaman pertama' : 'First page'}
            >
              <ChevronsLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: textPrimary }}
              aria-label={language === 'id' ? 'Halaman sebelumnya' : 'Previous page'}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            
            <div className="flex items-center gap-1 mx-1" role="group" aria-label={language === 'id' ? 'Nomor halaman' : 'Page numbers'}>
              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                let pageNum;
                const pages = totalPages || 1;
                if (pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pages - 2) {
                  pageNum = pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                const isCurrentPage = currentPage === pageNum;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 rounded-md text-sm font-mono transition-colors"
                    style={{
                      backgroundColor: isCurrentPage ? accentColor : 'transparent',
                      color: isCurrentPage ? (isDark ? '#0f0f0f' : '#ffffff') : textPrimary
                    }}
                    aria-label={`${language === 'id' ? 'Halaman' : 'Page'} ${pageNum}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: textPrimary }}
              aria-label={language === 'id' ? 'Halaman berikutnya' : 'Next page'}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: textPrimary }}
              aria-label={language === 'id' ? 'Halaman terakhir' : 'Last page'}
            >
              <ChevronsRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        isHidden={isHidden}
      />
    </div>
  );
}
