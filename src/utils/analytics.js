/**
 * Analytics utilities for financial data analysis
 */

/**
 * Calculate period comparison between two date ranges
 */
export function comparePeriods(transactions, currentPeriod, previousPeriod) {
  const currentData = filterByPeriod(transactions, currentPeriod);
  const previousData = filterByPeriod(transactions, previousPeriod);

  const current = calculatePeriodStats(currentData);
  const previous = calculatePeriodStats(previousData);

  return {
    current,
    previous,
    changes: {
      income: calculatePercentageChange(previous.income, current.income),
      expenses: calculatePercentageChange(previous.expenses, current.expenses),
      transactions: calculatePercentageChange(previous.transactionCount, current.transactionCount),
      netFlow: current.netFlow - previous.netFlow,
    },
  };
}

/**
 * Filter transactions by period (month)
 */
function filterByPeriod(transactions, period) {
  if (!period) return transactions;
  return transactions.filter(t => t.date && t.date.startsWith(period));
}

/**
 * Calculate stats for a period
 */
function calculatePeriodStats(transactions) {
  const income = transactions
    .filter(t => t.amount > 0 && !t.isReversal)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.amount < 0 && !t.isReversal)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    income,
    expenses,
    netFlow: income - expenses,
    transactionCount: transactions.filter(t => !t.isReversal).length,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue, newValue) {
  // If both values are 0, there's no change
  if (oldValue === 0 && newValue === 0) return 0;
  
  // If old value is 0 but new value is not, we can't calculate a meaningful percentage
  // For UI purposes, cap at reasonable maximum (1000% for increase, -1000% for decrease)
  if (oldValue === 0) {
    return newValue > 0 ? 1000 : -1000;
  }
  
  const percentageChange = ((newValue - oldValue) / oldValue) * 100;
  
  // Cap extreme values for display purposes
  if (percentageChange > 1000) return 1000;
  if (percentageChange < -1000) return -1000;
  
  return percentageChange;
}

/**
 * Get available months from transactions
 */
export function getAvailableMonths(transactions) {
  const months = new Set();
  transactions.forEach(t => {
    if (t.date) {
      months.add(t.date.substring(0, 7));
    }
  });
  return Array.from(months).sort().reverse();
}


