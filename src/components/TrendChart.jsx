import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, Camera, Check, Loader2, EyeOff, Eye } from 'lucide-react';
import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils/dataProcessor';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function TrendChart({ data, searchKeyword, summary, isHidden, skipEmptyPeriods = false, onToggleSkipEmpty }) {
  const [chartType, setChartType] = useState('area');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const chartRef = useRef(null);
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  // Theme colors
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const bgDarker = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';

  // Detect if data is daily or monthly based on periodType
  const isDaily = useMemo(() => {
    return data.length > 0 && data[0].periodType === 'day';
  }, [data]);

  // Format period label based on whether it's daily or monthly
  const formatPeriodLabel = useCallback((period) => {
    if (!period) return '';
    
    const months = language === 'id' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const parts = period.split('-');
    
    // Daily format: YYYY-MM-DD
    if (parts.length === 3) {
      const day = parseInt(parts[2]);
      const monthNum = parseInt(parts[1]);
      return `${day} ${months[monthNum - 1]}`;
    }
    
    // Monthly format: YYYY-MM
    if (parts.length === 2) {
      const [year, monthNum] = parts;
      return `${months[parseInt(monthNum) - 1]} '${year.slice(-2)}`;
    }
    
    return period;
  }, [language]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div 
        className="rounded-lg p-3 shadow-xl"
        style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: textPrimary }}>{formatPeriodLabel(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: textSecondary }}>{entry.name}:</span>
            <span 
              className="font-mono font-medium"
              style={{ color: entry.color }}
            >
              {isHidden ? '•••••••' : formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const formatYAxis = (value) => {
    if (isHidden) return '•••';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}${language === 'id' ? 'jt' : 'M'}`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}${language === 'id' ? 'rb' : 'K'}`;
    return value;
  };

  // Screenshot function
  const captureChart = useCallback(async () => {
    if (!chartRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: bgDarker,
        pixelRatio: 2,
      });

      const keyword = searchKeyword ? `_${searchKeyword.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const date = new Date().toISOString().split('T')[0];
      const filename = `financial_trend${keyword}_${date}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCaptureSuccess(true);
      showToast({ message: language === 'id' ? 'Chart berhasil disimpan!' : 'Chart saved!', type: 'success' });
      setTimeout(() => setCaptureSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to capture chart:', error);
      showToast({ message: language === 'id' ? 'Gagal mengambil screenshot' : 'Failed to capture', type: 'error' });
    } finally {
      setIsCapturing(false);
    }
  }, [searchKeyword, isCapturing, bgDarker, language, showToast]);

  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);

  const maskValue = (value) => {
    if (isHidden) return 'Rp •••••••••';
    return formatCurrency(value);
  };

  const incomeLabel = t('chart.income');
  const expensesLabel = t('chart.expenses');

  return (
    <div 
      ref={chartRef}
      className="rounded-xl p-4 md:p-5"
      style={{ 
        background: isDark 
          ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)' 
          : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
        border: `1px solid ${borderColor}` 
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
              {t('chart.title')}
            </h2>
            {searchKeyword && (
              <span className="px-2 py-0.5 text-xs rounded-md font-medium"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                "{searchKeyword}"
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: textSecondary }}>
            {isDaily 
              ? (language === 'id' ? 'Tren harian' : 'Daily trend')
              : (language === 'id' ? 'Tren bulanan' : 'Monthly trend')}
            {' • '}
            {language === 'id' ? 'Perbandingan pemasukan dan pengeluaran' : 'Income vs expenses comparison'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Skip Empty Toggle */}
          {onToggleSkipEmpty && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleSkipEmpty}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ 
                backgroundColor: skipEmptyPeriods ? `${accentColor}20` : bgDarker,
                border: `1px solid ${skipEmptyPeriods ? accentColor : borderColor}`,
                color: skipEmptyPeriods ? accentColor : textSecondary
              }}
              title={skipEmptyPeriods 
                ? (language === 'id' ? 'Tampilkan semua periode' : 'Show all periods')
                : (language === 'id' ? 'Sembunyikan periode kosong' : 'Hide empty periods')
              }
            >
              {skipEmptyPeriods ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {skipEmptyPeriods 
                  ? (language === 'id' ? 'Kosong' : 'Skip Empty')
                  : (language === 'id' ? 'Semua' : 'All')}
              </span>
            </motion.button>
          )}

          {/* Screenshot Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={captureChart}
            disabled={isCapturing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ 
              backgroundColor: captureSuccess ? 'rgba(16, 185, 129, 0.2)' : bgDarker,
              border: `1px solid ${captureSuccess ? 'rgba(16, 185, 129, 0.3)' : borderColor}`,
              color: captureSuccess ? '#10b981' : textSecondary,
              opacity: isCapturing ? 0.5 : 1
            }}
          >
            {isCapturing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : captureSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Screenshot</span>
              </>
            )}
          </motion.button>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: bgDarker }}>
            <button
              onClick={() => setChartType('area')}
              className="p-2 rounded-md transition-colors"
              style={{ 
                backgroundColor: chartType === 'area' ? `${accentColor}20` : 'transparent',
                color: chartType === 'area' ? accentColor : textSecondary
              }}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className="p-2 rounded-md transition-colors"
              style={{ 
                backgroundColor: chartType === 'bar' ? `${accentColor}20` : 'transparent',
                color: chartType === 'bar' ? accentColor : textSecondary
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats for Keyword */}
      {searchKeyword && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg p-3" style={{ backgroundColor: `${bgDarker}80` }}>
            <p className="text-xs mb-1" style={{ color: textSecondary }}>{incomeLabel}</p>
            <p className={`text-sm font-mono font-medium text-[#10b981] ${isHidden ? 'blur-sm' : ''}`}>
              {maskValue(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${bgDarker}80` }}>
            <p className="text-xs mb-1" style={{ color: textSecondary }}>{expensesLabel}</p>
            <p className={`text-sm font-mono font-medium text-[#ef4444] ${isHidden ? 'blur-sm' : ''}`}>
              {maskValue(totalExpenses)}
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${bgDarker}80` }}>
            <p className="text-xs mb-1" style={{ color: textSecondary }}>Net Flow</p>
            <p className={`text-sm font-mono font-medium ${totalIncome - totalExpenses >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'} ${isHidden ? 'blur-sm' : ''}`}>
              {maskValue(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
      )}

      <div className="h-[300px] min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriodLabel}
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: textSecondary, fontSize: '0.875rem' }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="income"
                name={incomeLabel}
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={expensesLabel}
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriodLabel}
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fill: textSecondary, fontSize: 11 }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: textSecondary, fontSize: '0.875rem' }}>{value}</span>}
              />
              <Bar 
                dataKey="income" 
                name={incomeLabel} 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name={expensesLabel} 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Watermark */}
      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${borderColor}50` }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
               style={{ background: `linear-gradient(to bottom right, ${isDark ? '#ffe600' : '#ca8a04'}, ${isDark ? '#e6cf00' : '#a16207'})` }}>
            <span className="text-[10px] font-bold" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>J</span>
          </div>
          <span className="text-xs" style={{ color: textSecondary }}>{t('app.title')} {t('app.subtitle')}</span>
        </div>
        <span className="text-xs font-mono" style={{ color: textSecondary }}>
          {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
