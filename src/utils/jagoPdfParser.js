/**
 * Jago PDF Parser
 * 
 * Native JavaScript implementation for parsing Bank Jago transaction history PDFs.
 * Ported from Python pipeline (extract_jago_pdf.py + normalize_jago_rows.py)
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// ============================================================================
// Constants & Regex Patterns
// ============================================================================

const MONTH_MAP_ID = {
  jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5,
  jun: 6, jul: 7, agt: 8, agu: 8, aug: 8,
  sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12,
};

// Indonesian date: "17 Jun 2021"
const DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/;
// Time: "18.01" or "18:01"
const TIME_RE = /^(\d{1,2})[.:](\d{2})\b/;
// Transaction ID
const ID_RE = /\bID#\s*([A-Za-z0-9_\-\/]+)/g;
// Reversal detection
const REVERSAL_RE = /\b(reversal|pembatalan)\b/i;
// Date range line (to skip)
const DATE_RANGE_RE = /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s*-\s*\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\b/i;

// Known transaction detail phrases (sorted by length, longest first)
const DETAIL_PHRASES = [
  'Pembayaran dengan Jago Pay',
  'Pembayaran Produk Digital',
  'Isi Saldo Dompet Digital',
  'Tambah Uang Kantong',
  'Tarik Uang Kantong',
  'Pembatalan Transaksi',
  'Pembayaran QRIS',
  'Transaksi POS',
  'Transfer Masuk',
  'Transfer Keluar',
  'Reversal POS',
  'Pajak Bunga',
  'Bunga',
].sort((a, b) => b.length - a.length);

// ============================================================================
// Number Parsing
// ============================================================================

/**
 * Parse Indonesian-formatted numbers like:
 *   - 5.704 .768  -> 5704768
 *   - 28.369,10   -> 28369.10
 *   - -14.548     -> -14548
 */
function parseIDRNumber(s) {
  if (s == null) return null;
  const raw = String(s).trim();
  if (raw === '') return null;

  // Extract sign
  let sign = 1;
  if (raw.startsWith('-')) sign = -1;

  // Keep only digits, separators, and commas
  let cleaned = raw.replace(/[^0-9.,\s]/g, '').replace(/\s+/g, '');
  if (cleaned === '') return null;

  // If there's a comma, treat it as decimal separator
  let numStr;
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    const intPart = parts[0].replace(/\./g, '');
    const decPart = parts[1] || '0';
    numStr = `${intPart}.${decPart}`;
  } else {
    // Dots are thousand separators
    numStr = cleaned.replace(/\./g, '');
  }

  const num = parseFloat(numStr);
  return isNaN(num) ? null : sign * num;
}

/**
 * Normalize number separators - fix patterns like "5.704 .768" -> "5.704.768"
 */
function normalizeNumberSeparators(s) {
  return s.replace(/(?<=\d)\.\s+(?=\d)/g, '.');
}

// ============================================================================
// Date/Time Parsing
// ============================================================================

/**
 * Parse date prefix from text. Returns { matched, year, month, day } or null.
 */
function parseDatePrefix(text) {
  const m = text.match(DATE_RE);
  if (!m) return null;

  const day = parseInt(m[1], 10);
  const monStr = m[2].toLowerCase();
  const month = MONTH_MAP_ID[monStr];
  if (!month) return null;

  const year = parseInt(m[3], 10);
  return { matched: m[0], year, month, day };
}

/**
 * Parse time prefix from text. Returns { matched, hour, minute } or null.
 */
function parseTimePrefix(text) {
  const m = text.match(TIME_RE);
  if (!m) return null;
  return {
    matched: m[0],
    hour: parseInt(m[1], 10),
    minute: parseInt(m[2], 10),
  };
}

// ============================================================================
// PDF Text Extraction
// ============================================================================

/**
 * Check if a line should be skipped (headers, footers, noise)
 */
function shouldSkipLine(line) {
  const low = line.toLowerCase().trim();
  if (!low) return true;
  if (low.includes('pockets transactions history')) return true;
  if (low.startsWith('halaman ')) return true;
  if (low.includes('pt bank jago')) return true;
  if (low.includes('www.jago.com')) return true;
  if (low.includes('menampilkan transaksi')) return true;
  if (low.startsWith('tanggal & waktu')) return true;
  if (low.startsWith('saldo terbaru')) return true;
  if (low.includes('info penting')) return true;
  if (low.includes('dokumen ini adalah')) return true;
  // Skip column headers
  if (low.includes('sumber/tujuan') && low.includes('rincian')) return true;
  return false;
}

/**
 * Extract text content from a PDF file
 */
async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const lines = [];
  const totalPages = pdf.numPages;
  
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress({ phase: 'extracting', current: pageNum, total: totalPages });
    }
    
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by their y-position to form lines
    const itemsByY = new Map();
    
    for (const item of textContent.items) {
      if (!item.str || !item.str.trim()) continue;
      
      // Round y to group items on same line
      const y = Math.round(item.transform[5]);
      
      if (!itemsByY.has(y)) {
        itemsByY.set(y, []);
      }
      itemsByY.get(y).push({
        x: item.transform[4],
        text: item.str,
      });
    }
    
    // Sort by y (descending - PDF coordinates start from bottom)
    const sortedYs = Array.from(itemsByY.keys()).sort((a, b) => b - a);
    
    for (const y of sortedYs) {
      const items = itemsByY.get(y);
      // Sort by x position
      items.sort((a, b) => a.x - b.x);
      
      const lineText = items.map(i => i.text).join(' ').replace(/\u00a0/g, ' ').trim();
      
      if (lineText && !shouldSkipLine(lineText)) {
        lines.push({
          page: pageNum,
          text: lineText,
        });
      }
    }
  }
  
  return lines;
}

// ============================================================================
// Row Stitching
// ============================================================================

/**
 * Groups multi-line PDF exports into transaction chunks.
 * Each transaction starts with a date prefix (DD Mon YYYY).
 */
function stitchRowsToTransactions(lines) {
  const stitched = [];
  let current = null;
  
  for (const line of lines) {
    const txt = line.text;
    
    // Check if this line starts a new transaction
    const isNewTx = parseDatePrefix(txt) !== null;
    
    // Skip date range lines like "17 Jun 2021 - 12 Des 2025"
    if (isNewTx && DATE_RANGE_RE.test(txt)) {
      continue;
    }
    
    if (isNewTx) {
      // Save previous transaction
      if (current !== null) {
        stitched.push(current);
      }
      // Start new transaction
      current = {
        page: line.page,
        rawText: txt,
        lines: [txt],
      };
      continue;
    }
    
    // Month headers like "Juli 2021" - treat as separator
    if (/^[A-Za-z]+(?:\s+\d{4})?$/.test(txt)) {
      if (current !== null) {
        stitched.push(current);
        current = null;
      }
      continue;
    }
    
    // Continuation line - append to current transaction
    if (current !== null) {
      current.rawText += '\n' + txt;
      current.lines.push(txt);
    }
  }
  
  // Don't forget the last transaction
  if (current !== null) {
    stitched.push(current);
  }
  
  return stitched;
}

// ============================================================================
// Amount & Balance Extraction
// ============================================================================

/**
 * Extract amount and balance from a line.
 * They typically appear as the last two numeric tokens.
 */
function extractAmountAndBalance(line) {
  const norm = normalizeNumberSeparators(line.replace(/\u00a0/g, ' ').trim());
  const tokens = norm.split(/\s+/).filter(Boolean);
  
  const numericPositions = [];
  for (let i = 0; i < tokens.length; i++) {
    // Match numbers with optional sign and dot/comma separators
    if (/^[+\-]?\$?[0-9][0-9.]*(?:,[0-9]+)?$/.test(tokens[i])) {
      numericPositions.push(i);
    }
  }
  
  if (numericPositions.length < 2) {
    return { amount: null, balance: null, strippedLine: norm };
  }
  
  const posAmount = numericPositions[numericPositions.length - 2];
  const posBalance = numericPositions[numericPositions.length - 1];
  
  const amount = parseIDRNumber(tokens[posAmount]);
  const balance = parseIDRNumber(tokens[posBalance]);
  
  // Remove amount and balance tokens from line
  const kept = tokens.filter((_, i) => i !== posAmount && i !== posBalance);
  
  return {
    amount,
    balance,
    strippedLine: kept.join(' ').trim(),
  };
}

// ============================================================================
// Transaction Normalization
// ============================================================================

/**
 * Parse a stitched transaction chunk into a structured transaction object.
 */
function parseTransaction(chunk, sourceFile) {
  const rawText = chunk.rawText;
  const firstLine = chunk.lines[0];
  
  // Parse date from first line
  const dateInfo = parseDatePrefix(firstLine);
  if (!dateInfo) {
    // Can't parse - skip this transaction
    return null;
  }
  
  const { year, month, day, matched: dateMatched } = dateInfo;
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // Parse time - usually on next line or embedded in first line
  let timeHM = null;
  
  // First check subsequent lines
  for (let i = 1; i < Math.min(chunk.lines.length, 4); i++) {
    const t = parseTimePrefix(chunk.lines[i].trim());
    if (t) {
      timeHM = { hour: t.hour, minute: t.minute };
      break;
    }
  }
  
  // Fallback: check rest of first line after date
  if (!timeHM) {
    const rest = firstLine.slice(dateMatched.length).trim();
    const t = parseTimePrefix(rest);
    if (t) {
      timeHM = { hour: t.hour, minute: t.minute };
    }
  }
  
  const timeStr = timeHM 
    ? `${String(timeHM.hour).padStart(2, '0')}:${String(timeHM.minute).padStart(2, '0')}`
    : null;
  const datetimeStr = timeStr ? `${dateStr} ${timeStr}` : null;
  
  // Extract amount and balance
  const { amount, balance, strippedLine } = extractAmountAndBalance(firstLine);
  
  // Extract transaction IDs
  const idMatches = [...rawText.matchAll(ID_RE)];
  const ids = [...new Set(idMatches.map(m => m[1]))];
  const transactionId = ids[0] || null;
  const transactionIds = ids.length > 0 ? ids.join(';') : null;
  
  // Check if reversal
  const isReversal = REVERSAL_RE.test(rawText);
  
  // Parse source/destination and transaction detail
  let sourceOrDest = '';
  let transactionDetail = '';
  let note = '';
  
  // Remove date and time from the body for parsing
  let body = strippedLine;
  if (dateMatched && body.startsWith(dateMatched)) {
    body = body.slice(dateMatched.length).trim();
  }
  // Remove time if present at start
  const timeMatch = body.match(/^(\d{1,2}[.:]\d{2})\s*/);
  if (timeMatch) {
    body = body.slice(timeMatch[0].length).trim();
  }
  
  // Find transaction detail phrase
  let detailFound = null;
  let detailIdx = -1;
  
  for (const phrase of DETAIL_PHRASES) {
    const idx = body.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx !== -1) {
      detailFound = phrase;
      detailIdx = idx;
      break;
    }
  }
  
  if (detailFound !== null) {
    sourceOrDest = body.slice(0, detailIdx).trim();
    transactionDetail = detailFound;
    note = body.slice(detailIdx + detailFound.length).trim();
  } else {
    // Fallback: keep everything as note
    note = body;
  }
  
  return {
    source_file: sourceFile,
    page: chunk.page,
    date: dateStr,
    time: timeStr,
    datetime: datetimeStr,
    source_or_destination: sourceOrDest,
    transaction_detail: transactionDetail,
    note: note,
    amount: amount,
    balance: balance,
    currency: 'IDR',
    transaction_id: transactionId,
    transaction_ids: transactionIds,
    is_reversal: isReversal,
    raw_text: rawText,
  };
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Parse a Jago PDF file and return an array of transaction objects.
 * 
 * @param {File} file - The PDF file to parse
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<Array>} Array of transaction objects
 */
export async function parseJagoPDF(file, onProgress) {
  const sourceFile = file.name;
  
  // Step 1: Extract text from PDF
  if (onProgress) {
    onProgress({ phase: 'starting', message: 'Memulai ekstraksi PDF...' });
  }
  
  const lines = await extractTextFromPDF(file, onProgress);
  
  if (lines.length === 0) {
    throw new Error('Tidak ada teks yang dapat diekstrak dari PDF');
  }
  
  // Step 2: Stitch lines into transaction chunks
  if (onProgress) {
    onProgress({ phase: 'stitching', message: 'Menggabungkan baris transaksi...' });
  }
  
  const chunks = stitchRowsToTransactions(lines);
  
  if (chunks.length === 0) {
    throw new Error('Tidak ada transaksi yang ditemukan dalam PDF');
  }
  
  // Step 3: Parse each chunk into a transaction
  if (onProgress) {
    onProgress({ phase: 'parsing', message: 'Memproses transaksi...', total: chunks.length });
  }
  
  const transactions = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const tx = parseTransaction(chunks[i], sourceFile);
    if (tx !== null) {
      transactions.push(tx);
    }
    
    if (onProgress && i % 50 === 0) {
      onProgress({ phase: 'parsing', current: i, total: chunks.length });
    }
  }
  
  if (transactions.length === 0) {
    throw new Error('Tidak ada transaksi valid yang berhasil diparsing');
  }
  
  if (onProgress) {
    onProgress({ phase: 'complete', message: `Berhasil memproses ${transactions.length} transaksi` });
  }
  
  return transactions;
}

/**
 * Check if a file is a Jago PDF based on filename pattern
 */
export function isJagoPDF(file) {
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf') && (
    name.includes('jago') || 
    name.includes('history') ||
    name.includes('transaksi')
  );
}

/**
 * Convert parsed transactions to CSV format string
 * (for compatibility with existing data processor)
 */
export function transactionsToCSV(transactions) {
  const headers = [
    'source_file', 'page', 'date', 'time', 'datetime',
    'source_or_destination', 'transaction_detail', 'note',
    'amount', 'balance', 'currency', 'transaction_id',
    'transaction_ids', 'is_reversal', 'raw_text'
  ];
  
  const escapeCSV = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = transactions.map(tx => 
    headers.map(h => escapeCSV(tx[h])).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

