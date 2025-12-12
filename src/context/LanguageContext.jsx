import { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext(null);

// Translations
const translations = {
  id: {
    // Header
    'app.title': 'Jago',
    'app.subtitle': 'Community Dashboard',
    'app.tagline': 'Analisis keuangan Bank Jago',
    'app.unofficial': 'Unofficial',
    'header.search': 'Cari transaksi...',
    'header.upload': 'Upload PDF',
    'header.export': 'Export',
    'header.period': 'Periode data',
    'header.allTypes': 'Semua Jenis',
    'header.dateRange': 'Rentang Tanggal',
    'header.transactionType': 'Jenis Transaksi',
    'header.reset': 'Reset',
    'header.close': 'Tutup',
    
    // Summary Cards
    'summary.income': 'Total Pemasukan',
    'summary.expenses': 'Total Pengeluaran',
    'summary.balance': 'Saldo Akhir',
    'summary.transactions': 'Transaksi',
    'summary.netFlow': 'Net Flow',
    'summary.savingsRate': 'Tingkat Tabungan',
    
    // Chart
    'chart.title': 'Tren Bulanan',
    'chart.income': 'Pemasukan',
    'chart.expenses': 'Pengeluaran',
    
    // Categories
    'category.title': 'Kategori Pengeluaran',
    'category.topMerchants': 'Top Merchant',
    'category.transactions': 'transaksi',
    
    // Transactions Table
    'table.title': 'Daftar Transaksi',
    'table.date': 'Tanggal',
    'table.source': 'Sumber/Tujuan',
    'table.type': 'Jenis',
    'table.amount': 'Jumlah',
    'table.balance': 'Saldo',
    'table.noData': 'Tidak ada transaksi',
    'table.showMore': 'Tampilkan Lebih',
    'table.showLess': 'Tampilkan Sedikit',
    
    // Empty State
    'empty.title': 'Analisis Keuangan',
    'empty.subtitle': 'Upload history transaksi Bank Jago Anda untuk melihat insight keuangan, tren pengeluaran, dan analisis kategori.',
    'empty.dropzone': 'Drop file PDF di sini',
    'empty.dropzoneHint': 'atau klik untuk memilih file history Jago',
    'empty.howTo': 'Cara mendapatkan file PDF',
    'empty.step1': 'Buka aplikasi Jago di HP Anda',
    'empty.step2': 'Tap ikon Profil di pojok kanan atas',
    'empty.step3': 'Pilih Riwayat Transaksi',
    'empty.step4': 'Tap tombol Download dan pilih periode',
    'empty.step5': 'File PDF akan tersimpan di HP Anda',
    'empty.feature1': 'Tren Bulanan',
    'empty.feature2': 'Kategori',
    'empty.feature3': '100% Lokal',
    'empty.privacy': 'Privasi Terjamin',
    'empty.privacyDesc': 'Semua data diproses secara lokal di browser Anda. Tidak ada data yang dikirim ke server manapun. Kode sumber terbuka untuk transparansi.',
    
    // Upload Modal
    'upload.title': 'Upload History Jago',
    'upload.description': 'Upload file PDF history transaksi dari aplikasi Bank Jago. File akan diproses secara otomatis untuk mengekstrak data transaksi.',
    'upload.dropzone': 'Drag & drop file PDF di sini',
    'upload.dropzoneHint': 'atau klik untuk memilih file',
    'upload.remove': 'Hapus file',
    'upload.cancel': 'Batal',
    'upload.submit': 'Upload',
    'upload.processing': 'Memproses...',
    'upload.extracting': 'Mengekstrak halaman',
    'upload.stitching': 'Menggabungkan transaksi...',
    'upload.parsing': 'Memproses transaksi',
    'upload.pdfOnly': 'Hanya file PDF yang didukung. Export history dari aplikasi Jago.',
    
    // Export Modal
    'export.title': 'Export Data',
    'export.csv': 'Export CSV',
    'export.pdf': 'Export PDF',
    'export.png': 'Export Gambar',
    'export.pngDesc': 'Gambar shareable untuk media sosial',
    'export.orientation': 'Pilih orientasi',
    'export.square': 'Kotak',
    'export.portrait': 'Potret',
    'export.landscape': 'Lanskap',
    'export.share': 'Bagikan',
    'export.save': 'Simpan',
    'export.back': 'Kembali',
    'export.loadingPreview': 'Memuat preview...',
    'export.imageSaved': 'Gambar berhasil disimpan!',
    'export.imageShared': 'Berhasil dibagikan!',
    'export.imageFailed': 'Gagal export gambar',
    
    // Analytics
    'analytics.comparison': 'Perbandingan Periode',
    'analytics.thisMonth': 'Bulan Ini',
    'analytics.lastMonth': 'Bulan Lalu',
    'analytics.budget': 'Budget',
    'analytics.spent': 'Terpakai',
    'analytics.remaining': 'Sisa',
    
    // Footer
    'footer.disclaimer': 'Tidak terafiliasi dengan PT Bank Jago Tbk',
    'footer.search': 'Cari',
    'footer.hide': 'Sembunyikan',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi Kesalahan',
    'common.retry': 'Coba Lagi',
    'common.success': 'Berhasil',
    'common.dataLoaded': 'Data berhasil dimuat!',
    'common.dataCleared': 'Data dihapus',
  },
  
  en: {
    // Header
    'app.title': 'Jago',
    'app.subtitle': 'Community Dashboard',
    'app.tagline': 'Jago Bank Financial Analysis',
    'app.unofficial': 'Unofficial',
    'header.search': 'Search transactions...',
    'header.upload': 'Upload PDF',
    'header.export': 'Export',
    'header.period': 'Data period',
    'header.allTypes': 'All Types',
    'header.dateRange': 'Date Range',
    'header.transactionType': 'Transaction Type',
    'header.reset': 'Reset',
    'header.close': 'Close',
    
    // Summary Cards
    'summary.income': 'Total Income',
    'summary.expenses': 'Total Expenses',
    'summary.balance': 'Final Balance',
    'summary.transactions': 'Transactions',
    'summary.netFlow': 'Net Flow',
    'summary.savingsRate': 'Savings Rate',
    
    // Chart
    'chart.title': 'Monthly Trend',
    'chart.income': 'Income',
    'chart.expenses': 'Expenses',
    
    // Categories
    'category.title': 'Expense Categories',
    'category.topMerchants': 'Top Merchants',
    'category.transactions': 'transactions',
    
    // Transactions Table
    'table.title': 'Transaction List',
    'table.date': 'Date',
    'table.source': 'Source/Destination',
    'table.type': 'Type',
    'table.amount': 'Amount',
    'table.balance': 'Balance',
    'table.noData': 'No transactions',
    'table.showMore': 'Show More',
    'table.showLess': 'Show Less',
    
    // Empty State
    'empty.title': 'Financial Analysis',
    'empty.subtitle': 'Upload your Bank Jago transaction history to see financial insights, spending trends, and category analysis.',
    'empty.dropzone': 'Drop PDF file here',
    'empty.dropzoneHint': 'or click to select Jago history file',
    'empty.howTo': 'How to get the PDF file',
    'empty.step1': 'Open the Jago app on your phone',
    'empty.step2': 'Tap the Profile icon in the top right corner',
    'empty.step3': 'Select Transaction History',
    'empty.step4': 'Tap Download button and choose the period',
    'empty.step5': 'The PDF file will be saved on your phone',
    'empty.feature1': 'Monthly Trends',
    'empty.feature2': 'Categories',
    'empty.feature3': '100% Local',
    'empty.privacy': 'Privacy Guaranteed',
    'empty.privacyDesc': 'All data is processed locally in your browser. No data is sent to any server. Open source code for transparency.',
    
    // Upload Modal
    'upload.title': 'Upload Jago History',
    'upload.description': 'Upload the PDF transaction history file from the Bank Jago app. The file will be processed automatically to extract transaction data.',
    'upload.dropzone': 'Drag & drop PDF file here',
    'upload.dropzoneHint': 'or click to select file',
    'upload.remove': 'Remove file',
    'upload.cancel': 'Cancel',
    'upload.submit': 'Upload',
    'upload.processing': 'Processing...',
    'upload.extracting': 'Extracting page',
    'upload.stitching': 'Stitching transactions...',
    'upload.parsing': 'Processing transactions',
    'upload.pdfOnly': 'Only PDF files are supported. Export history from the Jago app.',
    
    // Export Modal
    'export.title': 'Export Data',
    'export.csv': 'Export CSV',
    'export.pdf': 'Export PDF',
    'export.png': 'Export Image',
    'export.pngDesc': 'Shareable image for social media',
    'export.orientation': 'Choose orientation',
    'export.square': 'Square',
    'export.portrait': 'Portrait',
    'export.landscape': 'Landscape',
    'export.share': 'Share',
    'export.save': 'Save',
    'export.back': 'Back',
    'export.loadingPreview': 'Loading preview...',
    'export.imageSaved': 'Image saved successfully!',
    'export.imageShared': 'Shared successfully!',
    'export.imageFailed': 'Image export failed',
    
    // Analytics
    'analytics.comparison': 'Period Comparison',
    'analytics.thisMonth': 'This Month',
    'analytics.lastMonth': 'Last Month',
    'analytics.budget': 'Budget',
    'analytics.spent': 'Spent',
    'analytics.remaining': 'Remaining',
    
    // Footer
    'footer.disclaimer': 'Not affiliated with PT Bank Jago Tbk',
    'footer.search': 'Search',
    'footer.hide': 'Hide',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An Error Occurred',
    'common.retry': 'Try Again',
    'common.success': 'Success',
    'common.dataLoaded': 'Data loaded successfully!',
    'common.dataCleared': 'Data cleared',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jago-lang') || 'id';
    }
    return 'id';
  });

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const newLang = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('jago-lang', newLang);
      return newLang;
    });
  }, []);

  // Translation function
  const t = useCallback((key) => {
    return translations[language][key] || key;
  }, [language]);

  const isEnglish = language === 'en';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isEnglish }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

