import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpRight, ArrowDownRight, Eye, EyeOff, PiggyBank } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCurrency, AnimatedNumber, AnimatedPercentage } from './ui/AnimatedNumber';
import { formatNumber } from '../utils/dataProcessor';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function SummaryCards({ summary, isHidden, onToggleHidden }) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Theme colors
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';

  // Calculate savings rate
  const savingsRate = summary.income > 0 
    ? ((summary.income - summary.expenses) / summary.income) * 100 
    : 0;

  const cards = [
    {
      title: t('summary.income'),
      value: summary.income,
      icon: TrendingUp,
      color: '#10b981',
      bgGradient: isDark ? 'from-emerald-500/10 to-emerald-500/5' : 'from-emerald-500/5 to-emerald-500/[0.02]',
      borderColor: isDark ? 'border-emerald-500/30' : 'border-emerald-500/20',
      trend: ArrowUpRight,
    },
    {
      title: t('summary.expenses'),
      value: summary.expenses,
      icon: TrendingDown,
      color: '#ef4444',
      bgGradient: isDark ? 'from-red-500/10 to-red-500/5' : 'from-red-500/5 to-red-500/[0.02]',
      borderColor: isDark ? 'border-red-500/30' : 'border-red-500/20',
      trend: ArrowDownRight,
    },
    {
      title: t('summary.balance'),
      value: summary.balance,
      icon: Wallet,
      color: isDark ? '#00d9ff' : '#0891b2',
      bgGradient: isDark ? 'from-cyan-500/10 to-cyan-500/5' : 'from-cyan-500/5 to-cyan-500/[0.02]',
      borderColor: isDark ? 'border-cyan-500/30' : 'border-cyan-500/20',
    },
    {
      title: t('summary.transactions'),
      value: summary.totalTransactions,
      icon: Receipt,
      color: isDark ? '#a78bfa' : '#7c3aed',
      bgGradient: isDark ? 'from-violet-500/10 to-violet-500/5' : 'from-violet-500/5 to-violet-500/[0.02]',
      borderColor: isDark ? 'border-violet-500/30' : 'border-violet-500/20',
      isCount: true,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Toggle Button and Savings Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Savings Rate Indicator */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}
          >
            <PiggyBank className="w-4 h-4 text-[#10b981]" />
            <span className="text-xs" style={{ color: textSecondary }}>{t('summary.savingsRate')}:</span>
            {isHidden ? (
              <span className="text-sm font-medium text-[#10b981] blur-sm">••%</span>
            ) : (
              <AnimatedPercentage 
                value={savingsRate}
                className={`text-sm font-medium ${savingsRate >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
            )}
          </div>
        </div>
        
        {/* Toggle Button - Hidden on mobile since BottomNav has this */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleHidden}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors self-end sm:self-auto"
          style={{ 
            backgroundColor: bgCard, 
            border: `1px solid ${borderColor}`,
            color: textSecondary 
          }}
        >
          {isHidden ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>{t('footer.hide') === 'Sembunyikan' ? 'Tampilkan Nilai' : 'Show Values'}</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>{t('footer.hide') === 'Sembunyikan' ? 'Sembunyikan Nilai' : 'Hide Values'}</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} 
                        bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm p-5 
                        transition-shadow duration-300`}
            style={{ 
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Background glow effect */}
            <div 
              className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: card.color }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: textSecondary }}>{card.title}</span>
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                {card.isCount ? (
                  <AnimatedNumber
                    value={card.value}
                    formatter={formatNumber}
                    isHidden={isHidden}
                    hiddenText="•••••"
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: card.color, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                ) : (
                  <AnimatedCurrency
                    value={card.value}
                    isHidden={isHidden}
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: card.color, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                )}
                
                {card.trend && !isHidden && (
                  <card.trend 
                    className="w-5 h-5 mb-1" 
                    style={{ color: card.color }} 
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
