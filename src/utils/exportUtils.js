import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toBlob } from 'html-to-image';
import { formatCurrency, formatNumber } from './dataProcessor';

/**
 * Export transactions to CSV
 */
export function exportToCSV(transactions, filename = 'transactions.csv') {
  const headers = ['Tanggal', 'Waktu', 'Sumber/Tujuan', 'Jenis', 'Jumlah', 'Saldo', 'Catatan'];
  
  const rows = transactions.map(t => [
    t.date,
    t.datetime?.split(' ')[1] || '',
    t.source,
    t.type,
    t.amount,
    t.balance,
    t.note || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Generate and export PDF report
 */
export async function exportToPDF(summary, categoryData, topMerchants, dateRange, chartRef = null) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Helper function to add text
  const addText = (text, x, y, options = {}) => {
    const { size = 10, style = 'normal', color = [30, 30, 50] } = options;
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(...color);
    pdf.text(text, x, y);
    return y + (size * 0.5);
  };

  // Title
  yPos = addText('Laporan Keuangan', margin, yPos, { size: 18, style: 'bold', color: [0, 100, 150] });
  yPos += 5;

  // Date range
  if (dateRange.min && dateRange.max) {
    yPos = addText(`Periode: ${dateRange.min} - ${dateRange.max}`, margin, yPos, { size: 10, color: [100, 100, 100] });
  }
  yPos = addText(`Digenerate: ${new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })}`, margin, yPos, { size: 10, color: [100, 100, 100] });
  yPos += 10;

  // Summary Section
  pdf.setDrawColor(0, 180, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  yPos = addText('RINGKASAN KEUANGAN', margin, yPos, { size: 12, style: 'bold' });
  yPos += 5;

  // Summary grid
  const summaryItems = [
    { label: 'Total Pemasukan', value: formatCurrency(summary.income), color: [16, 185, 129] },
    { label: 'Total Pengeluaran', value: formatCurrency(summary.expenses), color: [239, 68, 68] },
    { label: 'Saldo Akhir', value: formatCurrency(summary.balance), color: [0, 180, 220] },
    { label: 'Jumlah Transaksi', value: formatNumber(summary.totalTransactions), color: [167, 139, 250] },
  ];

  const colWidth = (pageWidth - 2 * margin) / 2;
  summaryItems.forEach((item, i) => {
    const col = i % 2;
    const x = margin + col * colWidth;
    const y = yPos + Math.floor(i / 2) * 15;
    
    addText(item.label, x, y, { size: 9, color: [100, 100, 100] });
    addText(item.value, x, y + 5, { size: 11, style: 'bold', color: item.color });
  });
  yPos += 35;

  // Net Flow
  const netFlow = summary.income - summary.expenses;
  const savingsRate = summary.income > 0 ? ((netFlow / summary.income) * 100).toFixed(1) : 0;
  yPos = addText(`Net Flow: ${formatCurrency(netFlow)}`, margin, yPos, { 
    size: 11, style: 'bold', color: netFlow >= 0 ? [16, 185, 129] : [239, 68, 68] 
  });
  yPos = addText(`Tingkat Tabungan: ${savingsRate}%`, margin, yPos + 5, { size: 10 });
  yPos += 15;

  // Top Categories
  pdf.setDrawColor(0, 180, 220);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  yPos = addText('TOP KATEGORI PENGELUARAN', margin, yPos, { size: 12, style: 'bold' });
  yPos += 5;

  const topCategories = categoryData.slice(0, 5);
  topCategories.forEach((cat, i) => {
    const x = margin;
    const y = yPos + i * 8;
    addText(`${i + 1}. ${cat.name}`, x, y, { size: 9 });
    addText(formatCurrency(cat.value), x + 70, y, { size: 9, color: [100, 100, 100] });
    addText(`(${cat.count} transaksi)`, x + 120, y, { size: 8, color: [150, 150, 150] });
  });
  yPos += topCategories.length * 8 + 10;

  // Top Merchants
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setDrawColor(0, 180, 220);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  yPos = addText('TOP MERCHANT', margin, yPos, { size: 12, style: 'bold' });
  yPos += 5;

  const topMerch = topMerchants.slice(0, 5);
  topMerch.forEach((merchant, i) => {
    const x = margin;
    const y = yPos + i * 8;
    const name = merchant.name.length > 30 ? merchant.name.substring(0, 30) + '...' : merchant.name;
    addText(`${i + 1}. ${name}`, x, y, { size: 9 });
    addText(formatCurrency(merchant.total), x + 90, y, { size: 9, color: [100, 100, 100] });
  });
  yPos += topMerch.length * 8 + 10;

  // Chart image if provided
  if (chartRef) {
    try {
      const canvas = await html2canvas(chartRef, {
        backgroundColor: '#0f0f0f',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setDrawColor(0, 180, 220);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      yPos = addText('GRAFIK TREN BULANAN', margin, yPos, { size: 12, style: 'bold' });
      yPos += 5;
      
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, 80));
    } catch (err) {
      console.error('Failed to capture chart:', err);
    }
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Generated by Jago Financial Dashboard', margin, pdf.internal.pageSize.getHeight() - 10);

  // Save with Jago naming convention: Jago_[KantongName]_History_DDMMYYYY.pdf
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}${month}${year}`;
  const kantongName = 'Kantong Utama'; // Default placeholder
  const filename = `Jago_${kantongName}_History_${dateStr}.pdf`;
  pdf.save(filename);
  
  return filename;
}

/**
 * Helper to download blob
 */
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Parse uploaded CSV file
 */
export function parseUploadedCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export shareable card to PNG
 * @param {HTMLElement} cardRef - Reference to the ShareableCard element
 * @param {string} orientation - 'square' | 'portrait' | 'landscape'
 * @param {string} filename - Optional filename (without extension)
 * @returns {Promise<{blob: Blob, dataUrl: string}>}
 */
export async function exportToPNG(cardRef, orientation = 'square', filename = null) {
  if (!cardRef) {
    throw new Error('Card reference is required');
  }

  // Generate filename with Jago naming convention
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}${month}${year}`;
  const finalFilename = filename || `Jago_Summary_${orientation}_${dateStr}`;

  try {
    // Common options for html-to-image
    const imageOptions = {
      quality: 1.0,
      pixelRatio: 2, // 2x for retina/high-DPI displays
      skipAutoScale: false,
      cacheBust: true,
      // Skip external fonts to avoid CORS issues with Google Fonts
      skipFonts: true,
      // Use filter to exclude external stylesheets that cause CORS issues
      filter: (node) => {
        // Skip link elements that point to external stylesheets (cause CORS issues)
        if (node.tagName === 'LINK') {
          const href = node.href || '';
          if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
            return false;
          }
        }
        // Skip style elements that might reference external resources
        if (node.tagName === 'STYLE') {
          const textContent = node.textContent || '';
          if (textContent.includes('fonts.googleapis.com')) {
            return false;
          }
        }
        return true;
      },
      // Provide fallback font CSS to ensure text renders nicely
      fontEmbedCSS: `
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        }
      `,
    };

    // Use html-to-image for high quality PNG generation
    const dataUrl = await toPng(cardRef, imageOptions);

    // Convert to blob for download/share
    const blob = await toBlob(cardRef, imageOptions);

    return { blob, dataUrl, filename: `${finalFilename}.png` };
  } catch (err) {
    console.error('Failed to generate PNG:', err);
    throw new Error('Failed to generate image: ' + err.message);
  }
}

/**
 * Download PNG from blob
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename with extension
 */
export function downloadPNG(blob, filename) {
  downloadBlob(blob, filename);
}

/**
 * Share PNG using Web Share API (if available)
 * @param {Blob} blob - PNG blob
 * @param {string} filename - Filename for sharing
 * @param {string} title - Share title
 * @param {string} text - Share text
 * @returns {Promise<boolean>} - True if shared successfully
 */
export async function sharePNG(blob, filename, title = 'Financial Summary', text = 'Check out my financial summary!') {
  // Check if Web Share API is available and supports files
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  const file = new File([blob], filename, { type: 'image/png' });
  const shareData = {
    files: [file],
    title,
    text,
  };

  // Check if the data can be shared
  if (!navigator.canShare(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    // User cancelled or share failed
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err);
    }
    return false;
  }
}

/**
 * Check if Web Share API is available for files
 * @returns {boolean}
 */
export function canShareFiles() {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }
  
  // Create a test file to check if file sharing is supported
  const testFile = new File(['test'], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
}

