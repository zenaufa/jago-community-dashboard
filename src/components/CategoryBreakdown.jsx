import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Store, Settings, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber } from '../utils/dataProcessor';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AllMerchantsModal } from './modals/AllMerchantsModal';

const COLORS = [
  '#00d9ff', '#10b981', '#f59e0b', '#ef4444', '#a78bfa',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#eab308', '#e11d48', '#8b5cf6', '#22c55e',
];

const INITIAL_MERCHANTS_SHOWN = 5;

export function CategoryBreakdown({ categoryData, topMerchants, allMerchants, isHidden, onOpenCategoryRules, onSelectMerchant }) {
  const [showMoreMerchants, setShowMoreMerchants] = useState(false);
  const [allMerchantsModalOpen, setAllMerchantsModalOpen] = useState(false);
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  
  // Theme colors
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const bgDarker = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  const maskValue = (value) => {
    if (isHidden) return 'Rp •••••••';
    return formatCurrency(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
    
    return (
      <div className="rounded-lg p-3 shadow-xl"
           style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
        <p className="font-medium mb-1" style={{ color: textPrimary }}>{data.name}</p>
        <p className="text-sm" style={{ color: payload[0].payload.fill }}>
          <span className="font-mono">{maskValue(data.value)}</span>
          <span className="ml-2" style={{ color: textSecondary }}>({percentage}%)</span>
        </p>
        <p className="text-xs mt-1" style={{ color: textSecondary }}>
          {formatNumber(data.count)} {t('category.transactions')}
        </p>
      </div>
    );
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textPrimary}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart */}
      <div 
        className="rounded-xl p-4 md:p-5"
        style={{ 
          background: isDark 
            ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)' 
            : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
          border: `1px solid ${borderColor}` 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
              <PieIcon className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
                {t('category.title')}
              </h3>
              <p className="text-xs" style={{ color: textSecondary }}>
                {language === 'id' ? 'Distribusi berdasarkan kategori' : 'Distribution by category'}
              </p>
            </div>
          </div>
          {onOpenCategoryRules && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCategoryRules}
              className="p-2 rounded-lg transition-colors"
              style={{ color: textSecondary }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="h-[280px] min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke={bgDarker}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Scrollable for all categories */}
        <div className="mt-4">
          <div 
            className="flex flex-wrap gap-2 justify-center max-h-[100px] overflow-y-auto p-1 rounded-lg"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: `${borderColor} transparent`
            }}
          >
            {categoryData.map((cat, index) => {
              const percentage = ((cat.value / totalExpenses) * 100).toFixed(1);
              return (
                <div 
                  key={cat.name}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md cursor-default hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: bgDarker }}
                  title={`${cat.name}: ${maskValue(cat.value)} (${percentage}%)`}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span style={{ color: textSecondary }} className="truncate max-w-[80px]">
                    {cat.name}
                  </span>
                  <span 
                    className="text-[10px] font-mono" 
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
          {categoryData.length > 6 && (
            <p className="text-[10px] text-center mt-1" style={{ color: textSecondary }}>
              {language === 'id' 
                ? `${categoryData.length} kategori total` 
                : `${categoryData.length} total categories`}
            </p>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div 
        className="rounded-xl p-5"
        style={{ 
          background: isDark 
            ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)' 
            : 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
          border: `1px solid ${borderColor}` 
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${purpleColor}15` }}>
            <Store className="w-4 h-4" style={{ color: purpleColor }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
              {t('category.topMerchants')}
            </h3>
            <p className="text-xs" style={{ color: textSecondary }}>
              {language === 'id' ? 'Merchant dengan pengeluaran tertinggi' : 'Merchants with highest spending'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {(showMoreMerchants ? topMerchants : topMerchants.slice(0, INITIAL_MERCHANTS_SHOWN)).map((merchant, index) => {
              const percentage = (merchant.total / topMerchants[0].total) * 100;
              
              const handleClick = () => {
                if (onSelectMerchant) {
                  onSelectMerchant(merchant.name);
                }
              };
              
              return (
                <motion.div 
                  key={merchant.name} 
                  className="group cursor-pointer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: index >= INITIAL_MERCHANTS_SHOWN ? (index - INITIAL_MERCHANTS_SHOWN) * 0.03 : 0 }}
                  onClick={handleClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick();
                    }
                  }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-mono w-5 h-5 rounded flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${COLORS[index % COLORS.length]}20`,
                          color: COLORS[index % COLORS.length],
                        }}
                      >
                        {index + 1}
                      </span>
                      <span 
                        className="text-sm truncate max-w-[140px] group-hover:underline" 
                        style={{ color: textPrimary }} 
                        title={`${merchant.name} - ${language === 'id' ? 'Klik untuk filter' : 'Click to filter'}`}
                      >
                        {merchant.name}
                      </span>
                    </div>
                    <span 
                      className={`text-sm font-mono font-medium ${isHidden ? 'blur-sm' : ''}`}
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      {maskValue(merchant.total)}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: bgDarker }}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  
                  <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>
                    {formatNumber(merchant.count)} {t('category.transactions')}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {/* Show More / Show Less Button */}
          {topMerchants.length > INITIAL_MERCHANTS_SHOWN && (
            <motion.button
              onClick={() => setShowMoreMerchants(!showMoreMerchants)}
              className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: bgDarker,
                color: textSecondary,
                border: `1px solid ${borderColor}`,
              }}
              whileHover={{ backgroundColor: `${purpleColor}10`, borderColor: `${purpleColor}30` }}
              whileTap={{ scale: 0.98 }}
            >
              {showMoreMerchants ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {language === 'id' ? 'Sembunyikan' : 'Show Less'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {language === 'id' 
                    ? `+${topMerchants.length - INITIAL_MERCHANTS_SHOWN} Lainnya` 
                    : `+${topMerchants.length - INITIAL_MERCHANTS_SHOWN} More`}
                </>
              )}
            </motion.button>
          )}
          
          {/* View All Merchants Button */}
          {allMerchants && allMerchants.length > 0 && (
            <motion.button
              onClick={() => setAllMerchantsModalOpen(true)}
              className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: `${purpleColor}10`,
                color: purpleColor,
                border: `1px solid ${purpleColor}30`,
              }}
              whileHover={{ backgroundColor: `${purpleColor}20` }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              {language === 'id' 
                ? `Lihat Semua (${allMerchants.length})` 
                : `View All (${allMerchants.length})`}
            </motion.button>
          )}
        </div>
      </div>

      {/* All Merchants Modal */}
      <AllMerchantsModal
        isOpen={allMerchantsModalOpen}
        onClose={() => setAllMerchantsModalOpen(false)}
        merchants={allMerchants}
        isHidden={isHidden}
        onSelectMerchant={onSelectMerchant}
      />
    </div>
  );
}
