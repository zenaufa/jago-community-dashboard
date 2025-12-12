import { useState, useMemo, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import {
  parseTransactions,
  calculateSummary,
  groupByMonth,
  groupByPeriod,
  groupByCategory,
  getTopMerchants,
  filterByDateRange,
  searchTransactions,
  getTransactionTypes,
  getDateRange,
} from '../utils/dataProcessor';

const STORAGE_KEY = 'jago_transaction_data';

// Helper to save data to localStorage
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Failed to save transaction data to localStorage:', e);
    return false;
  }
}

// Helper to load data from localStorage
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load transaction data from localStorage:', e);
  }
  return null;
}

// Helper to clear storage
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear transaction data from localStorage:', e);
  }
}

export function useTransactionData() {
  // Initialize state from localStorage if available
  const [rawData, setRawData] = useState(() => {
    const saved = loadFromStorage();
    return saved?.transactions || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(() => {
    const saved = loadFromStorage();
    return saved?.transactions?.length > 0 || false;
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
    transactionType: '',
    skipEmptyPeriods: false,
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (rawData.length > 0) {
      saveToStorage({ 
        transactions: rawData,
        savedAt: new Date().toISOString()
      });
    }
  }, [rawData]);

  // Load data from CSV text
  const loadFromCSV = useCallback((csvText) => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(results.errors[0].message));
            return;
          }
          const parsed = parseTransactions(results.data);
          if (parsed.length === 0) {
            reject(new Error('Tidak ada transaksi valid ditemukan dalam file'));
            return;
          }
          setRawData(parsed);
          setHasData(true);
          setError(null);
          resolve(parsed);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }, []);

  // Load from uploaded file
  const loadFromFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      await loadFromCSV(text);
    } catch (err) {
      setError(err.message || 'Gagal memuat file');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [loadFromCSV]);

  // Load sample data
  const loadSampleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/sample_transactions.csv');
      if (!response.ok) {
        throw new Error('Sample data tidak ditemukan');
      }
      const csvText = await response.text();
      await loadFromCSV(csvText);
    } catch (err) {
      setError(err.message || 'Gagal memuat sample data');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [loadFromCSV]);

  // No auto-loading - users should upload their own PDF

  // Clear data
  const clearData = useCallback(() => {
    setRawData([]);
    setHasData(false);
    setError(null);
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: '',
      transactionType: '',
    });
    clearStorage(); // Also clear from localStorage
  }, []);

  // Apply filters
  const filteredData = useMemo(() => {
    let data = rawData;

    // Date range filter
    if (filters.startDate || filters.endDate) {
      data = filterByDateRange(data, filters.startDate, filters.endDate);
    }

    // Search filter
    if (filters.searchTerm) {
      data = searchTransactions(data, filters.searchTerm);
    }

    // Transaction type filter
    if (filters.transactionType) {
      data = data.filter(t => t.type === filters.transactionType);
    }

    return data;
  }, [rawData, filters]);

  // Calculated values
  const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);
  // Only fill date gaps when BOTH filter dates are set (explicit date range)
  const shouldFillGaps = filters.startDate && filters.endDate;
  const monthlyTrend = useMemo(() => 
    groupByPeriod(
      filteredData, 
      shouldFillGaps ? filters.startDate : null, 
      shouldFillGaps ? filters.endDate : null,
      filters.skipEmptyPeriods
    ), 
    [filteredData, filters.startDate, filters.endDate, shouldFillGaps, filters.skipEmptyPeriods]
  );
  const categoryBreakdown = useMemo(() => groupByCategory(filteredData), [filteredData]);
  const topMerchants = useMemo(() => getTopMerchants(filteredData, 10), [filteredData]);
  const allMerchants = useMemo(() => getTopMerchants(filteredData, Infinity), [filteredData]);
  const transactionTypes = useMemo(() => getTransactionTypes(rawData), [rawData]);
  const dateRange = useMemo(() => getDateRange(rawData), [rawData]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: '',
      transactionType: '',
      skipEmptyPeriods: false,
    });
  }, []);

  return {
    loading,
    error,
    hasData,
    transactions: filteredData,
    allTransactions: rawData,
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
    loadSampleData,
    clearData,
  };
}
