/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Parse and clean transaction data from CSV
 */
export function parseTransactions(rawData) {
  return rawData
    .filter(row => row.date && row.amount !== undefined && row.amount !== '')
    .map(row => {
      const transaction = {
        ...row,
        date: row.date,
        datetime: row.datetime,
        amount: parseFloat(row.amount) || 0,
        balance: parseFloat(row.balance) || 0,
        isReversal: row.is_reversal === 'True',
        source: row.source_or_destination || 'Unknown',
        type: row.transaction_detail || 'Unknown',
        note: row.note || '',
      };
      // Add category for analytics
      transaction.category = categorizeTransaction(transaction);
      return transaction;
    });
}

/**
 * Calculate summary statistics
 */
export function calculateSummary(transactions) {
  const income = transactions
    .filter(t => t.amount > 0 && !t.isReversal)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const latestBalance = transactions.length > 0
    ? transactions[transactions.length - 1].balance
    : 0;

  const totalTransactions = transactions.filter(t => !t.isReversal).length;

  return {
    income,
    expenses,
    balance: latestBalance,
    totalTransactions,
    netFlow: income - expenses,
  };
}

/**
 * Format date to YYYY-MM-DD using local time
 */
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Group transactions by day for daily trend analysis
 * @param {Array} transactions - The transactions to group
 * @param {string} filterStartDate - Optional start date from filter (YYYY-MM-DD)
 * @param {string} filterEndDate - Optional end date from filter (YYYY-MM-DD)
 */
export function groupByDay(transactions, filterStartDate = null, filterEndDate = null) {
  const grouped = {};

  transactions.forEach(t => {
    if (!t.date) return;
    const dayKey = t.date; // YYYY-MM-DD
    
    if (!grouped[dayKey]) {
      grouped[dayKey] = {
        period: dayKey,
        periodType: 'day',
        income: 0,
        expenses: 0,
        count: 0,
      };
    }

    if (t.amount > 0 && !t.isReversal) {
      grouped[dayKey].income += t.amount;
    } else if (t.amount < 0) {
      grouped[dayKey].expenses += Math.abs(t.amount);
    }
    grouped[dayKey].count++;
  });

  // Only fill gaps when BOTH filter dates are explicitly provided
  // This prevents filling gaps for unfiltered data spanning years
  if (filterStartDate && filterEndDate) {
    const startDateStr = filterStartDate;
    const endDateStr = filterEndDate;
    // Parse dates correctly using local time
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const key = formatDateKey(current);
      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          periodType: 'day',
          income: 0,
          expenses: 0,
          count: 0,
        };
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Group transactions by month for trend analysis
 * @param {Array} transactions - The transactions to group
 * @param {string} filterStartDate - Optional start date from filter (YYYY-MM-DD)
 * @param {string} filterEndDate - Optional end date from filter (YYYY-MM-DD)
 */
export function groupByMonth(transactions, filterStartDate = null, filterEndDate = null) {
  const grouped = {};

  transactions.forEach(t => {
    if (!t.date) return;
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        month: monthKey,
        period: monthKey,
        periodType: 'month',
        income: 0,
        expenses: 0,
        count: 0,
      };
    }

    if (t.amount > 0 && !t.isReversal) {
      grouped[monthKey].income += t.amount;
    } else if (t.amount < 0) {
      grouped[monthKey].expenses += Math.abs(t.amount);
    }
    grouped[monthKey].count++;
  });

  // Only fill gaps when BOTH filter dates are explicitly provided
  // This prevents filling gaps for unfiltered data spanning years
  if (filterStartDate && filterEndDate) {
    const startMonthStr = filterStartDate.substring(0, 7);
    const endMonthStr = filterEndDate.substring(0, 7);
    const [startYear, startMonth] = startMonthStr.split('-').map(Number);
    const [endYear, endMonth] = endMonthStr.split('-').map(Number);
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = {
          month: key,
          period: key,
          periodType: 'month',
          income: 0,
          expenses: 0,
          count: 0,
        };
      }
      
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
  }

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate number of days between two dates
 */
function getDaysBetween(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return Infinity;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Smart grouping: daily for short ranges, monthly for long ranges
 * @param {Array} transactions - The transactions to group
 * @param {string} filterStartDate - Optional start date from filter (YYYY-MM-DD)
 * @param {string} filterEndDate - Optional end date from filter (YYYY-MM-DD)
 * @param {boolean} skipEmpty - If true, skip periods with no transactions (default: false)
 */
export function groupByPeriod(transactions, filterStartDate = null, filterEndDate = null, skipEmpty = false) {
  if (transactions.length === 0) return [];
  
  // Determine date range - from filter or from transactions
  let rangeStart = filterStartDate;
  let rangeEnd = filterEndDate;
  
  if (!rangeStart || !rangeEnd) {
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    rangeStart = rangeStart || dates[0];
    rangeEnd = rangeEnd || dates[dates.length - 1];
  }
  
  // Calculate range length in days
  const dayCount = getDaysBetween(rangeStart, rangeEnd);
  
  // Use daily grouping for ranges <= 62 days (about 2 months)
  // Use monthly grouping for longer ranges
  const useDaily = dayCount <= 62;
  
  let result;
  if (useDaily) {
    result = groupByDay(transactions, filterStartDate, filterEndDate);
  } else {
    result = groupByMonth(transactions, filterStartDate, filterEndDate);
  }
  
  // Optionally skip periods with no transactions
  if (skipEmpty) {
    result = result.filter(d => d.income > 0 || d.expenses > 0 || d.count > 0);
  }
  
  return result;
}

/**
 * Group transactions by category/merchant
 */
export function groupByCategory(transactions) {
  const grouped = {};

  transactions.forEach(t => {
    if (t.amount >= 0 || t.isReversal) return; // Only count expenses
    
    const category = categorizeTransaction(t);
    
    if (!grouped[category]) {
      grouped[category] = {
        name: category,
        value: 0,
        count: 0,
      };
    }

    grouped[category].value += Math.abs(t.amount);
    grouped[category].count++;
  });

  return Object.values(grouped)
    .sort((a, b) => b.value - a.value)
    .slice(0, 15); // Top 15 categories
}

/**
 * Categorize transaction based on source/destination
 */
export function categorizeTransaction(t) {
  const source = (t.source || '').toUpperCase();
  const type = (t.type || '').toUpperCase();

  // E-commerce
  if (source.includes('TOKOPEDIA') || source.includes('SHOPEE') || source.includes('LAZADA') || source.includes('BUKALAPAK')) {
    return 'E-Commerce';
  }
  
  // Food & Beverage
  if (source.includes('GOFOOD') || source.includes('GRABFOOD') || source.includes('SHOPEEFOOD') || 
      source.includes('KFC') || source.includes('MCDONALD') || source.includes('STARBUCKS') ||
      source.includes('CHATIME') || source.includes('KOPI')) {
    return 'Food & Beverage';
  }

  // Transportation
  if (source.includes('GOJEK') || source.includes('GRAB') || source.includes('GORIDE') || 
      source.includes('GOCAR') || source.includes('INDRIVER')) {
    return 'Transport';
  }

  // Digital Services
  if (source.includes('GOOGLE') || source.includes('APPLE') || source.includes('NETFLIX') || 
      source.includes('SPOTIFY') || source.includes('YOUTUBE') || source.includes('DISCORD') ||
      source.includes('STEAM') || source.includes('PLAYSTATION')) {
    return 'Digital Services';
  }

  // PayPal transactions
  if (source.includes('PAYPAL') || source.includes('PP*')) {
    return 'PayPal';
  }

  // Gaming
  if (source.includes('STEAM') || source.includes('EPIC') || source.includes('RIOT') ||
      source.includes('GAME') || source.includes('UNIPIN') || source.includes('CODASHOP')) {
    return 'Gaming';
  }

  // Bills & Utilities
  if (source.includes('PLN') || source.includes('TELKOM') || source.includes('INDIHOME') ||
      source.includes('PDAM') || type.includes('TAGIHAN')) {
    return 'Bills & Utilities';
  }

  // Transfers
  if (type.includes('TRANSFER') || type.includes('PINDAH')) {
    return 'Transfers';
  }

  // QRIS payments
  if (source.includes('QRIS') || type.includes('QRIS')) {
    return 'QRIS Payments';
  }

  // International
  if (source.includes('ALIEXPRESS') || source.includes('ALIBABA') || source.includes('AMAZON')) {
    return 'International Shopping';
  }

  // Internal transfers (Kantong)
  if (source.includes('KANTONG') || type.includes('KANTONG')) {
    return 'Internal Transfer';
  }

  // Top-up
  if (type.includes('TOP UP') || type.includes('TOPUP')) {
    return 'Top-up';
  }

  // Interest & fees
  if (type.includes('BUNGA') || type.includes('PAJAK')) {
    return 'Interest & Tax';
  }

  return 'Other';
}

/**
 * Get top merchants by spending
 */
export function getTopMerchants(transactions, limit = 10) {
  const merchants = {};

  transactions.forEach(t => {
    if (t.amount >= 0 || t.isReversal || !t.source) return;
    
    const merchant = t.source.trim();
    if (!merchant || merchant === 'Unknown') return;

    if (!merchants[merchant]) {
      merchants[merchant] = {
        name: merchant,
        total: 0,
        count: 0,
      };
    }

    merchants[merchant].total += Math.abs(t.amount);
    merchants[merchant].count++;
  });

  return Object.values(merchants)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions;

  return transactions.filter(t => {
    const txDate = t.date;
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });
}

/**
 * Filter transactions by search term
 */
export function searchTransactions(transactions, searchTerm) {
  if (!searchTerm) return transactions;
  
  const term = searchTerm.toLowerCase();
  return transactions.filter(t => 
    (t.source || '').toLowerCase().includes(term) ||
    (t.type || '').toLowerCase().includes(term) ||
    (t.note || '').toLowerCase().includes(term)
  );
}

/**
 * Get unique transaction types
 */
export function getTransactionTypes(transactions) {
  const types = new Set();
  transactions.forEach(t => {
    if (t.type) types.add(t.type);
  });
  return Array.from(types).sort();
}

/**
 * Get date range from transactions
 */
export function getDateRange(transactions) {
  if (transactions.length === 0) return { min: null, max: null };
  
  const dates = transactions.map(t => t.date).filter(Boolean).sort();
  return {
    min: dates[0],
    max: dates[dates.length - 1],
  };
}

