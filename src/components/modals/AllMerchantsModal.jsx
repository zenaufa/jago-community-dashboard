import { useState, useMemo, useEffect } from 'react';
import { 
  Store, Search, X, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from '../ui/Modal';
import { formatCurrency, formatNumber } from '../../utils/dataProcessor';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const COLORS = [
  '#00d9ff', '#10b981', '#f59e0b', '#ef4444', '#a78bfa',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#eab308', '#e11d48', '#8b5cf6', '#22c55e',
];

const ITEMS_PER_PAGE = 10;

export function AllMerchantsModal({ isOpen, onClose, merchants, isHidden, onSelectMerchant }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total'); // 'total' | 'count' | 'name'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // Theme colors
  const bgDarker = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  // Reset page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDir]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Filter and sort merchants
  const filteredMerchants = useMemo(() => {
    let result = [...(merchants || [])];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(search));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'count':
          aVal = a.count;
          bVal = b.count;
          break;
        case 'total':
        default:
          aVal = a.total;
          bVal = b.total;
      }
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [merchants, searchTerm, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredMerchants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMerchants = filteredMerchants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3" style={{ color: textSecondary }} />;
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="w-3 h-3" style={{ color: accentColor }} />
      : <ArrowDown className="w-3 h-3" style={{ color: accentColor }} />;
  };

  const maxTotal = merchants?.[0]?.total || 1;

  const title = language === 'id' ? 'Semua Merchant' : 'All Merchants';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Header Stats */}
        <div 
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: bgDarker }}
        >
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${purpleColor}15` }}
          >
            <Store className="w-5 h-5" style={{ color: purpleColor }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: textPrimary }}>
              {formatNumber(merchants?.length || 0)} {language === 'id' ? 'Merchant' : 'Merchants'}
            </p>
            <p className="text-xs" style={{ color: textSecondary }}>
              {language === 'id' ? 'Total pengeluaran ke semua merchant' : 'Total spending across all merchants'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
          <input
            type="text"
            placeholder={language === 'id' ? 'Cari merchant...' : 'Search merchants...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
            style={{ 
              backgroundColor: bgDarker, 
              border: `1px solid ${borderColor}`,
              color: textPrimary,
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70"
              style={{ color: textSecondary }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: textSecondary }}>
            {language === 'id' ? 'Urutkan:' : 'Sort by:'}
          </span>
          <button
            onClick={() => handleSort('total')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
            style={{ 
              backgroundColor: sortBy === 'total' ? `${accentColor}20` : bgDarker,
              color: sortBy === 'total' ? accentColor : textSecondary,
              border: `1px solid ${sortBy === 'total' ? accentColor : borderColor}`,
            }}
          >
            {language === 'id' ? 'Total' : 'Amount'} <SortIcon column="total" />
          </button>
          <button
            onClick={() => handleSort('count')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
            style={{ 
              backgroundColor: sortBy === 'count' ? `${accentColor}20` : bgDarker,
              color: sortBy === 'count' ? accentColor : textSecondary,
              border: `1px solid ${sortBy === 'count' ? accentColor : borderColor}`,
            }}
          >
            {language === 'id' ? 'Transaksi' : 'Transactions'} <SortIcon column="count" />
          </button>
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
            style={{ 
              backgroundColor: sortBy === 'name' ? `${accentColor}20` : bgDarker,
              color: sortBy === 'name' ? accentColor : textSecondary,
              border: `1px solid ${sortBy === 'name' ? accentColor : borderColor}`,
            }}
          >
            {language === 'id' ? 'Nama' : 'Name'} <SortIcon column="name" />
          </button>
        </div>

        {/* Merchants List */}
        <div className="space-y-2">
          {paginatedMerchants.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: textSecondary }}>
                {language === 'id' ? 'Tidak ada merchant ditemukan' : 'No merchants found'}
              </p>
            </div>
          ) : (
            paginatedMerchants.map((merchant, index) => {
              const percentage = (merchant.total / maxTotal) * 100;
              const originalIndex = merchants?.findIndex(m => m.name === merchant.name) ?? index;
              const displayIndex = startIndex + index;
              
              const handleMerchantClick = () => {
                if (onSelectMerchant) {
                  onSelectMerchant(merchant.name);
                  onClose();
                }
              };
              
              return (
                <motion.div 
                  key={merchant.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-3 rounded-xl cursor-pointer transition-all active:scale-[0.99]"
                  style={{ backgroundColor: bgDarker }}
                  onClick={handleMerchantClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMerchantClick();
                    }
                  }}
                  whileHover={{ backgroundColor: `${accentColor}10` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span 
                        className="text-xs font-mono w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: `${COLORS[originalIndex % COLORS.length]}20`,
                          color: COLORS[originalIndex % COLORS.length],
                        }}
                      >
                        {originalIndex + 1}
                      </span>
                      <span 
                        className="text-sm font-medium truncate hover:underline" 
                        style={{ color: textPrimary }} 
                        title={`${merchant.name} - ${language === 'id' ? 'Klik untuk filter' : 'Click to filter'}`}
                      >
                        {merchant.name}
                      </span>
                    </div>
                    <span 
                      className={`text-sm font-mono font-medium flex-shrink-0 ${isHidden ? 'blur-sm' : ''}`}
                      style={{ color: COLORS[originalIndex % COLORS.length] }}
                    >
                      {isHidden ? 'Rp •••••' : formatCurrency(merchant.total)}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: borderColor }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[originalIndex % COLORS.length],
                      }}
                    />
                  </div>
                  
                  <p className="text-[10px]" style={{ color: textSecondary }}>
                    {formatNumber(merchant.count)} {language === 'id' ? 'transaksi' : 'transactions'}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-2"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <p className="text-xs order-2 sm:order-1" style={{ color: textSecondary }}>
              {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredMerchants.length)} {language === 'id' ? 'dari' : 'of'} {filteredMerchants.length}
            </p>
            
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: textPrimary }}
                aria-label={language === 'id' ? 'Halaman pertama' : 'First page'}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: textPrimary }}
                aria-label={language === 'id' ? 'Sebelumnya' : 'Previous'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className="w-7 h-7 rounded-md text-xs font-mono transition-colors"
                      style={{
                        backgroundColor: currentPage === pageNum ? accentColor : 'transparent',
                        color: currentPage === pageNum ? (isDark ? '#0f0f0f' : '#ffffff') : textPrimary
                      }}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: textPrimary }}
                aria-label={language === 'id' ? 'Berikutnya' : 'Next'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: textPrimary }}
                aria-label={language === 'id' ? 'Halaman terakhir' : 'Last page'}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer hint */}
        <p className="text-[10px] text-center" style={{ color: accentColor }}>
          {language === 'id' 
            ? '💡 Klik merchant untuk filter transaksi'
            : '💡 Click a merchant to filter transactions'}
        </p>
      </div>
    </Modal>
  );
}
