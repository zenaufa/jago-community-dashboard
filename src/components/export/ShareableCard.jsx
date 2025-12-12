import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ShoppingBag, Store, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/dataProcessor';

// Orientation dimensions
const DIMENSIONS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

export const ShareableCard = forwardRef(function ShareableCard(
  { summary, categoryData, topMerchants, comparison, dateRange, orientation = 'square', isDark = true, language = 'id' },
  ref
) {
  const dim = DIMENSIONS[orientation];
  const scale = orientation === 'landscape' ? 0.6 : orientation === 'portrait' ? 0.5 : 0.55;
  
  // Theme colors
  const colors = isDark ? {
    bgGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
    cardBg: 'rgba(26, 26, 46, 0.8)',
    borderColor: 'rgba(42, 42, 78, 0.6)',
    textPrimary: '#e4e4e7',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#ffe600',
    positive: '#10b981',
    negative: '#ef4444',
    purple: '#a78bfa',
    cyan: '#00d9ff',
  } : {
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    accent: '#ca8a04',
    positive: '#059669',
    negative: '#dc2626',
    purple: '#7c3aed',
    cyan: '#0891b2',
  };

  // Calculate net flow and savings rate
  const netFlow = summary.income - summary.expenses;
  const savingsRate = summary.income > 0 ? ((netFlow / summary.income) * 100).toFixed(1) : 0;
  const isPositiveFlow = netFlow >= 0;

  // Get top category and merchant
  const topCategoryRaw = categoryData?.[0] || null;
  const topMerchant = topMerchants?.[0] || null;
  
  // Calculate percentage for topCategory if not provided
  const totalCategoryValue = categoryData?.reduce((sum, cat) => sum + (cat.value || 0), 0) || 0;
  const topCategory = topCategoryRaw ? {
    ...topCategoryRaw,
    percentage: topCategoryRaw.percentage ?? (totalCategoryValue > 0 ? (topCategoryRaw.value / totalCategoryValue) * 100 : 0),
  } : null;

  // Period change indicator
  const periodChange = comparison?.changes?.expenses ?? 0;

  // Labels based on language
  const labels = language === 'id' ? {
    netFlow: 'Net Flow',
    income: 'Pemasukan',
    expenses: 'Pengeluaran',
    balance: 'Saldo Akhir',
    savingsRate: 'Tingkat Tabungan',
    topCategory: 'Kategori Teratas',
    topMerchant: 'Merchant Teratas',
    transactions: 'transaksi',
    vsLastMonth: 'vs bulan lalu',
    period: 'Periode',
    generatedWith: 'dibuat dengan',
  } : {
    netFlow: 'Net Flow',
    income: 'Income',
    expenses: 'Expenses',
    balance: 'Final Balance',
    savingsRate: 'Savings Rate',
    topCategory: 'Top Category',
    topMerchant: 'Top Merchant',
    transactions: 'transactions',
    vsLastMonth: 'vs last month',
    period: 'Period',
    generatedWith: 'generated with',
  };

  // Shared styles
  const cardStyle = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '24px',
    backdropFilter: 'blur(12px)',
  };

  const iconBadgeStyle = (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    backgroundColor: `${color}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  // Render the card based on orientation
  const renderContent = () => {
    if (orientation === 'landscape') {
      return renderLandscapeLayout();
    } else if (orientation === 'portrait') {
      return renderPortraitLayout();
    }
    return renderSquareLayout();
  };

  // Square Layout (1080x1080)
  const renderSquareLayout = () => (
    <div style={{ padding: '60px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontFamily: 'Plus Jakarta Sans, sans-serif', 
          fontSize: '42px', 
          fontWeight: 700, 
          color: colors.textPrimary,
          margin: 0,
        }}>
          {labels.netFlow}
        </h1>
        {dateRange?.min && dateRange?.max && (
          <p style={{ 
            fontFamily: 'Plus Jakarta Sans, sans-serif', 
            fontSize: '18px', 
            color: colors.textSecondary,
            marginTop: '8px',
          }}>
            {dateRange.min} — {dateRange.max}
          </p>
        )}
      </div>

      {/* Hero Net Flow */}
      <div style={{ 
        ...cardStyle, 
        padding: '48px', 
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px' 
        }}>
          <span style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '72px',
            fontWeight: 700,
            color: isPositiveFlow ? colors.positive : colors.negative,
          }}>
            {formatCurrency(netFlow)}
          </span>
          {isPositiveFlow ? (
            <ArrowUpRight size={48} color={colors.positive} />
          ) : (
            <ArrowDownRight size={48} color={colors.negative} />
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px',
          marginTop: '12px',
        }}>
          <PiggyBank size={24} color={colors.cyan} />
          <span style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '24px',
            color: colors.cyan,
          }}>
            {savingsRate}% {labels.savingsRate}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px',
        marginBottom: '32px',
        flex: 1,
      }}>
        {/* Income */}
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={iconBadgeStyle(colors.positive)}>
              <TrendingUp size={24} color={colors.positive} />
            </div>
            <div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.income}</p>
              <p style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '28px', 
                fontWeight: 700, 
                color: colors.positive,
                margin: '4px 0 0 0',
              }}>
                {formatCurrency(summary.income)}
              </p>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={iconBadgeStyle(colors.negative)}>
              <TrendingDown size={24} color={colors.negative} />
            </div>
            <div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.expenses}</p>
              <p style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '28px', 
                fontWeight: 700, 
                color: colors.negative,
                margin: '4px 0 0 0',
              }}>
                {formatCurrency(summary.expenses)}
              </p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={iconBadgeStyle(colors.cyan)}>
              <Wallet size={24} color={colors.cyan} />
            </div>
            <div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.balance}</p>
              <p style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '28px', 
                fontWeight: 700, 
                color: colors.cyan,
                margin: '4px 0 0 0',
              }}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={iconBadgeStyle(colors.purple)}>
              <ShoppingBag size={24} color={colors.purple} />
            </div>
            <div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.transactions}</p>
              <p style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: '28px', 
                fontWeight: 700, 
                color: colors.purple,
                margin: '4px 0 0 0',
              }}>
                {formatNumber(summary.totalTransactions)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Category & Merchant */}
      {(topCategory || topMerchant) && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          {topCategory && (
            <div style={{ ...cardStyle, padding: '24px', flex: 1 }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 8px 0' }}>
                {labels.topCategory}
              </p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                color: colors.textPrimary, 
                margin: '0 0 8px 0' 
              }}>
                {topCategory.name}
              </p>
              <div style={{ 
                height: '8px', 
                backgroundColor: colors.borderColor, 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  width: `${topCategory.percentage}%`, 
                  height: '100%', 
                  backgroundColor: colors.accent,
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ 
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px', 
                color: colors.textMuted, 
                margin: '8px 0 0 0' 
              }}>
                {topCategory.percentage.toFixed(1)}% • {formatCurrency(topCategory.value)}
              </p>
            </div>
          )}
          {topMerchant && (
            <div style={{ ...cardStyle, padding: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBadgeStyle(colors.accent)}>
                  <Store size={24} color={colors.accent} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                    {labels.topMerchant}
                  </p>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: colors.textPrimary, 
                    margin: '4px 0 0 0',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {topMerchant.name}
                  </p>
                  <p style={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '16px', 
                    color: colors.accent, 
                    margin: '4px 0 0 0' 
                  }}>
                    {formatCurrency(topMerchant.total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.borderColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: colors.accent }}>Jago</span>
            <span style={{ fontSize: '16px', color: colors.textSecondary }}> Community Dashboard</span>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
          {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );

  // Portrait Layout (1080x1920)
  const renderPortraitLayout = () => (
    <div style={{ padding: '60px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        <h1 style={{ 
          fontFamily: 'Plus Jakarta Sans, sans-serif', 
          fontSize: '36px', 
          fontWeight: 700, 
          color: colors.textPrimary,
          margin: 0,
        }}>
          Financial Summary
        </h1>
        {dateRange?.min && dateRange?.max && (
          <p style={{ 
            fontFamily: 'Plus Jakarta Sans, sans-serif', 
            fontSize: '18px', 
            color: colors.textSecondary,
            marginTop: '12px',
          }}>
            {dateRange.min} — {dateRange.max}
          </p>
        )}
      </div>

      {/* Hero Net Flow */}
      <div style={{ 
        ...cardStyle, 
        padding: '56px 40px', 
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '18px', color: colors.textSecondary, margin: '0 0 16px 0' }}>
          {labels.netFlow}
        </p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px' 
        }}>
          <span style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '64px',
            fontWeight: 700,
            color: isPositiveFlow ? colors.positive : colors.negative,
          }}>
            {formatCurrency(netFlow)}
          </span>
          {isPositiveFlow ? (
            <ArrowUpRight size={40} color={colors.positive} />
          ) : (
            <ArrowDownRight size={40} color={colors.negative} />
          )}
        </div>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: `${colors.cyan}15`,
          borderRadius: '12px',
        }}>
          <PiggyBank size={24} color={colors.cyan} />
          <span style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '20px',
            color: colors.cyan,
          }}>
            {savingsRate}% {labels.savingsRate}
          </span>
        </div>
      </div>

      {/* Stats Grid - Vertical */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        marginBottom: '40px',
      }}>
        {/* Income */}
        <div style={{ ...cardStyle, padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={iconBadgeStyle(colors.positive)}>
                <TrendingUp size={24} color={colors.positive} />
              </div>
              <p style={{ fontSize: '20px', color: colors.textSecondary, margin: 0 }}>{labels.income}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '28px', 
              fontWeight: 700, 
              color: colors.positive,
              margin: 0,
            }}>
              {formatCurrency(summary.income)}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ ...cardStyle, padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={iconBadgeStyle(colors.negative)}>
                <TrendingDown size={24} color={colors.negative} />
              </div>
              <p style={{ fontSize: '20px', color: colors.textSecondary, margin: 0 }}>{labels.expenses}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '28px', 
              fontWeight: 700, 
              color: colors.negative,
              margin: 0,
            }}>
              {formatCurrency(summary.expenses)}
            </p>
          </div>
        </div>

        {/* Balance */}
        <div style={{ ...cardStyle, padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={iconBadgeStyle(colors.cyan)}>
                <Wallet size={24} color={colors.cyan} />
              </div>
              <p style={{ fontSize: '20px', color: colors.textSecondary, margin: 0 }}>{labels.balance}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '28px', 
              fontWeight: 700, 
              color: colors.cyan,
              margin: 0,
            }}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Category */}
      {topCategory && (
        <div style={{ ...cardStyle, padding: '32px', marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', color: colors.textSecondary, margin: '0 0 16px 0' }}>
            {labels.topCategory}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              color: colors.textPrimary, 
              margin: 0 
            }}>
              {topCategory.name}
            </p>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '20px', 
              color: colors.accent,
              margin: 0,
            }}>
              {formatCurrency(topCategory.value)}
            </p>
          </div>
          <div style={{ 
            height: '12px', 
            backgroundColor: colors.borderColor, 
            borderRadius: '6px', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${topCategory.percentage}%`, 
              height: '100%', 
              backgroundColor: colors.accent,
              borderRadius: '6px',
            }} />
          </div>
          <p style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '16px', 
            color: colors.textMuted, 
            margin: '12px 0 0 0' 
          }}>
            {topCategory.percentage.toFixed(1)}% of total expenses • {topCategory.count} {labels.transactions}
          </p>
        </div>
      )}

      {/* Top Merchant */}
      {topMerchant && (
        <div style={{ ...cardStyle, padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={iconBadgeStyle(colors.accent)}>
              <Store size={28} color={colors.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>
                {labels.topMerchant}
              </p>
              <p style={{ 
                fontSize: '22px', 
                fontWeight: 600, 
                color: colors.textPrimary, 
                margin: '8px 0 0 0',
              }}>
                {topMerchant.name}
              </p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '24px', 
              fontWeight: 700,
              color: colors.accent, 
              margin: 0,
            }}>
              {formatCurrency(topMerchant.total)}
            </p>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        paddingTop: '24px',
        borderTop: `1px solid ${colors.borderColor}`,
      }}>
        <p style={{ fontSize: '16px', color: colors.textMuted, margin: 0 }}>
          {labels.generatedWith} <span style={{ color: colors.accent, fontWeight: 600 }}>Jago</span> Community Dashboard
        </p>
        <p style={{ fontSize: '14px', color: colors.textMuted, margin: '8px 0 0 0' }}>
          {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );

  // Landscape Layout (1920x1080)
  const renderLandscapeLayout = () => (
    <div style={{ padding: '48px 60px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: colors.accent }}>Jago</span>
            <span style={{ fontSize: '24px', color: colors.textSecondary }}> Community Dashboard</span>
          </div>
        </div>
        {dateRange?.min && dateRange?.max && (
          <div style={{ 
            padding: '12px 24px',
            backgroundColor: colors.cardBg,
            borderRadius: '12px',
            border: `1px solid ${colors.borderColor}`,
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: colors.textSecondary,
              margin: 0,
            }}>
              {dateRange.min} — {dateRange.max}
            </p>
          </div>
        )}
      </div>

      {/* Main Content - 3 Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1.2fr 1fr', 
        gap: '32px',
        flex: 1,
      }}>
        {/* Left Column - Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Income */}
          <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={iconBadgeStyle(colors.positive)}>
                <TrendingUp size={24} color={colors.positive} />
              </div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.income}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '32px', 
              fontWeight: 700, 
              color: colors.positive,
              margin: 0,
            }}>
              {formatCurrency(summary.income)}
            </p>
          </div>

          {/* Expenses */}
          <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={iconBadgeStyle(colors.negative)}>
                <TrendingDown size={24} color={colors.negative} />
              </div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.expenses}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '32px', 
              fontWeight: 700, 
              color: colors.negative,
              margin: 0,
            }}>
              {formatCurrency(summary.expenses)}
            </p>
          </div>

          {/* Balance */}
          <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={iconBadgeStyle(colors.cyan)}>
                <Wallet size={24} color={colors.cyan} />
              </div>
              <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0 }}>{labels.balance}</p>
            </div>
            <p style={{ 
              fontFamily: 'JetBrains Mono, monospace', 
              fontSize: '32px', 
              fontWeight: 700, 
              color: colors.cyan,
              margin: 0,
            }}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Center Column - Hero Net Flow */}
        <div style={{ 
          ...cardStyle, 
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ fontSize: '20px', color: colors.textSecondary, margin: '0 0 24px 0' }}>
            {labels.netFlow}
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '20px' 
          }}>
            <span style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '72px',
              fontWeight: 700,
              color: isPositiveFlow ? colors.positive : colors.negative,
            }}>
              {formatCurrency(netFlow)}
            </span>
            {isPositiveFlow ? (
              <ArrowUpRight size={56} color={colors.positive} />
            ) : (
              <ArrowDownRight size={56} color={colors.negative} />
            )}
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            marginTop: '32px',
            padding: '16px 32px',
            backgroundColor: `${colors.cyan}15`,
            borderRadius: '16px',
          }}>
            <PiggyBank size={28} color={colors.cyan} />
            <span style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '24px',
              fontWeight: 600,
              color: colors.cyan,
            }}>
              {savingsRate}%
            </span>
            <span style={{ fontSize: '18px', color: colors.textSecondary }}>
              {labels.savingsRate}
            </span>
          </div>
          <p style={{ 
            fontSize: '16px', 
            color: colors.textMuted, 
            margin: '24px 0 0 0',
            textAlign: 'center',
          }}>
            {formatNumber(summary.totalTransactions)} {labels.transactions}
          </p>
        </div>

        {/* Right Column - Top Category & Merchant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Category */}
          {topCategory && (
            <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 16px 0' }}>
                {labels.topCategory}
              </p>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                color: colors.textPrimary, 
                margin: '0 0 12px 0' 
              }}>
                {topCategory.name}
              </p>
              <div style={{ 
                height: '10px', 
                backgroundColor: colors.borderColor, 
                borderRadius: '5px', 
                overflow: 'hidden',
                marginBottom: '12px',
              }}>
                <div style={{ 
                  width: `${topCategory.percentage}%`, 
                  height: '100%', 
                  backgroundColor: colors.accent,
                  borderRadius: '5px',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px', 
                  color: colors.textMuted, 
                  margin: 0,
                }}>
                  {topCategory.percentage.toFixed(1)}%
                </p>
                <p style={{ 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '18px', 
                  color: colors.accent, 
                  margin: 0,
                  fontWeight: 600,
                }}>
                  {formatCurrency(topCategory.value)}
                </p>
              </div>
            </div>
          )}

          {/* Top Merchant */}
          {topMerchant && (
            <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={iconBadgeStyle(colors.accent)}>
                  <Store size={24} color={colors.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                    {labels.topMerchant}
                  </p>
                  <p style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: colors.textPrimary, 
                    margin: '8px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {topMerchant.name}
                  </p>
                  <p style={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '24px', 
                    fontWeight: 700,
                    color: colors.accent, 
                    margin: 0,
                  }}>
                    {formatCurrency(topMerchant.total)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Period Comparison Indicator */}
          {comparison && (
            <div style={{ ...cardStyle, padding: '28px', flex: 1 }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 12px 0' }}>
                {labels.vsLastMonth}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {periodChange <= 0 ? (
                  <ArrowDownRight size={32} color={colors.positive} />
                ) : (
                  <ArrowUpRight size={32} color={colors.negative} />
                )}
                <span style={{ 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: periodChange <= 0 ? colors.positive : colors.negative,
                }}>
                  {periodChange > 0 ? '+' : ''}{periodChange.toFixed(1)}%
                </span>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: colors.textMuted, 
                margin: '8px 0 0 0',
              }}>
                {labels.expenses}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '24px',
        marginTop: '24px',
        borderTop: `1px solid ${colors.borderColor}`,
      }}>
        <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
          {labels.generatedWith} Jago Community Dashboard • {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -9999,
      }}
    >
      <div
        ref={ref}
        style={{
          width: `${dim.width}px`,
          height: `${dim.height}px`,
          background: colors.bgGradient,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
});

