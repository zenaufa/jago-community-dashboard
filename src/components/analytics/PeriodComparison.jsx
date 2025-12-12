import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Minus, Calendar } from 'lucide-react';
import { comparePeriods, getAvailableMonths } from '../../utils/analytics';
import { formatCurrency } from '../../utils/dataProcessor';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function PeriodComparison({ transactions, isHidden }) {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  
  // Theme colors
  const bgDarker = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';

  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);
  
  const [currentMonth, setCurrentMonth] = useState(() => availableMonths[0] || '');
  const [previousMonth, setPreviousMonth] = useState(() => availableMonths[1] || '');

  const comparison = useMemo(() => {
    if (!currentMonth || !previousMonth) return null;
    return comparePeriods(transactions, currentMonth, previousMonth);
  }, [transactions, currentMonth, previousMonth]);

  if (!comparison || availableMonths.length < 2) {
    return null;
  }

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = language === 'id' ? monthsId : monthsEn;
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const ChangeIndicator = ({ value, inverted = false }) => {
    const isPositive = inverted ? value < 0 : value > 0;
    const isNegative = inverted ? value > 0 : value < 0;
    
    return (
      <div className="flex items-center gap-1 text-sm font-medium"
           style={{ color: isPositive ? '#10b981' : isNegative ? '#ef4444' : textSecondary }}>
        {value > 0 ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : value < 0 ? (
          <ArrowDownRight className="w-4 h-4" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div 
      className="rounded-xl p-4 md:p-5"
      style={{ 
        background: isDark 
          ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)' 
          : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
        border: `1px solid ${borderColor}` 
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${purpleColor}15` }}>
            <Calendar className="w-4 h-4" style={{ color: purpleColor }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
              {t('analytics.comparison')}
            </h3>
            <p className="text-xs" style={{ color: textSecondary }}>
              {language === 'id' ? 'Bandingkan dua periode berbeda' : 'Compare two different periods'}
            </p>
          </div>
        </div>
        
        {/* Period Selectors */}
        <div className="flex items-center gap-2 text-sm">
          <select
            value={previousMonth}
            onChange={(e) => setPreviousMonth(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs focus:outline-none transition-colors"
            style={{ backgroundColor: bgDarker, border: `1px solid ${borderColor}`, color: textPrimary }}
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>{formatMonth(month)}</option>
            ))}
          </select>
          <span style={{ color: textSecondary }}>vs</span>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs focus:outline-none transition-colors"
            style={{ backgroundColor: bgDarker, border: `1px solid ${borderColor}`, color: textPrimary }}
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>{formatMonth(month)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Income */}
        <motion.div 
          className="p-3 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${bgDarker}80` }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>{t('chart.income')}</p>
          <div className={`text-base font-bold text-[#10b981] mb-1 truncate ${isHidden ? 'blur-sm' : ''}`}
               style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {isHidden ? 'Rp •••' : formatCurrency(comparison.current.income)}
          </div>
          <ChangeIndicator value={comparison.changes.income} />
        </motion.div>

        {/* Expenses */}
        <motion.div 
          className="p-3 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${bgDarker}80` }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>{t('chart.expenses')}</p>
          <div className={`text-base font-bold text-[#ef4444] mb-1 truncate ${isHidden ? 'blur-sm' : ''}`}
               style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {isHidden ? 'Rp •••' : formatCurrency(comparison.current.expenses)}
          </div>
          <ChangeIndicator value={comparison.changes.expenses} inverted />
        </motion.div>

        {/* Net Flow */}
        <motion.div 
          className="p-3 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${bgDarker}80` }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>Net Flow</p>
          <div className={`text-base font-bold mb-1 truncate ${isHidden ? 'blur-sm' : ''}`} 
               style={{ color: comparison.current.netFlow >= 0 ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
            {isHidden ? 'Rp •••' : formatCurrency(comparison.current.netFlow)}
          </div>
          <div className={`text-xs truncate ${isHidden ? 'blur-sm' : ''}`}
               style={{ color: comparison.changes.netFlow >= 0 ? '#10b981' : '#ef4444' }}>
            {isHidden ? '•••' : `${comparison.changes.netFlow >= 0 ? '+' : ''}${formatCurrency(comparison.changes.netFlow)}`}
          </div>
        </motion.div>

        {/* Savings Rate */}
        <motion.div 
          className="p-3 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${bgDarker}80` }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>{t('summary.savingsRate')}</p>
          <div className={`text-base font-bold mb-1 ${isHidden ? 'blur-sm' : ''}`}
               style={{ color: comparison.current.savingsRate >= 0 ? accentColor : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
            {isHidden ? '••%' : (
              comparison.current.income === 0 
                ? 'N/A' 
                : `${comparison.current.savingsRate.toFixed(1)}%`
            )}
          </div>
          <p className="text-xs" style={{ color: textSecondary }}>
            {comparison.current.transactionCount} {language === 'id' ? 'transaksi' : 'transactions'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
