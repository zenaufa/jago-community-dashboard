import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, FileSpreadsheet, Loader2, CheckCircle, Image, Square, RectangleVertical, RectangleHorizontal, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ShareableCard } from '../export/ShareableCard';
import { exportToCSV, exportToPDF, exportToPNG, downloadPNG } from '../../utils/exportUtils';
import { comparePeriods, getAvailableMonths } from '../../utils/analytics';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const ORIENTATIONS = [
  { id: 'square', icon: Square, label: { id: 'Kotak', en: 'Square' }, hint: 'Instagram, Facebook', dimensions: '1080×1080' },
  { id: 'portrait', icon: RectangleVertical, label: { id: 'Potret', en: 'Portrait' }, hint: 'Stories, TikTok', dimensions: '1080×1920' },
  { id: 'landscape', icon: RectangleHorizontal, label: { id: 'Lanskap', en: 'Landscape' }, hint: 'Twitter/X, LinkedIn', dimensions: '1920×1080' },
];

export function ExportModal({ 
  isOpen, 
  onClose, 
  transactions, 
  summary, 
  categoryData, 
  topMerchants, 
  dateRange,
  chartRef 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showPNGOptions, setShowPNGOptions] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState('square');
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const shareableCardRef = useRef(null);
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  // Calculate comparison data for shareable card
  const comparison = useMemo(() => {
    const availableMonths = getAvailableMonths(transactions);
    if (availableMonths.length < 2) return null;
    return comparePeriods(transactions, availableMonths[0], availableMonths[1]);
  }, [transactions]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPNGOptions(false);
      setSelectedOrientation('square');
      setPreviewDataUrl(null);
      setExportType(null);
    }
  }, [isOpen]);

  // Generate preview when orientation changes or PNG options are shown
  useEffect(() => {
    if (showPNGOptions && shareableCardRef.current) {
      generatePreview();
    }
  }, [showPNGOptions, selectedOrientation, isDark]);

  const generatePreview = async () => {
    if (!shareableCardRef.current) return;
    
    setIsGeneratingPreview(true);
    try {
      // Small delay to ensure the card is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { dataUrl } = await exportToPNG(shareableCardRef.current, selectedOrientation);
      setPreviewDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Generate filename following Jago naming convention
  const generateFilename = (extension) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}${month}${year}`;
    const kantongName = 'Kantong Utama';
    return `Jago_${kantongName}_History_${dateStr}.${extension}`;
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    setExportType('csv');
    try {
      const filename = generateFilename('csv');
      exportToCSV(transactions, filename);
      const message = language === 'id' 
        ? 'Data berhasil diexport ke CSV!' 
        : 'Data exported to CSV successfully!';
      showToast({ message, type: 'success' });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      const message = language === 'id' 
        ? 'Gagal export CSV: ' + err.message 
        : 'CSV export failed: ' + err.message;
      showToast({ message, type: 'error' });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      await exportToPDF(summary, categoryData, topMerchants, dateRange, chartRef);
      const message = language === 'id' 
        ? 'Laporan PDF berhasil dibuat!' 
        : 'PDF report created successfully!';
      showToast({ message, type: 'success' });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      const message = language === 'id' 
        ? 'Gagal export PDF: ' + err.message 
        : 'PDF export failed: ' + err.message;
      showToast({ message, type: 'error' });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPNG = async () => {
    if (!shareableCardRef.current) return;
    
    setIsExporting(true);
    setExportType('png');
    try {
      const { blob, filename } = await exportToPNG(shareableCardRef.current, selectedOrientation);
      downloadPNG(blob, filename);
      const message = language === 'id' 
        ? 'Gambar berhasil disimpan!' 
        : 'Image saved successfully!';
      showToast({ message, type: 'success' });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      const message = language === 'id' 
        ? 'Gagal export gambar: ' + err.message 
        : 'Image export failed: ' + err.message;
      showToast({ message, type: 'error' });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Calculate preview dimensions for display
  const getPreviewDimensions = () => {
    const maxWidth = 280;
    const maxHeight = 320;
    
    switch (selectedOrientation) {
      case 'portrait':
        return { width: maxHeight * (1080 / 1920), height: maxHeight };
      case 'landscape':
        return { width: maxWidth, height: maxWidth * (1080 / 1920) };
      default: // square
        return { width: Math.min(maxWidth, maxHeight), height: Math.min(maxWidth, maxHeight) };
    }
  };

  const previewDims = getPreviewDimensions();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={showPNGOptions ? t('export.png') : t('export.title')} 
      size={showPNGOptions ? 'md' : 'sm'}
    >
      <AnimatePresence mode="wait">
        {!showPNGOptions ? (
          // Main Export Options
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm" style={{ color: textSecondary }}>
              {language === 'id' 
                ? 'Pilih format export untuk data transaksi Anda.' 
                : 'Choose export format for your transaction data.'}
            </p>

            {/* Export Options */}
            <div className="space-y-3">
              {/* PNG Option - NEW */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowPNGOptions(true)}
                disabled={isExporting}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition-colors"
                style={{
                  backgroundColor: bgPrimary,
                  borderColor: borderColor,
                }}
              >
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${purpleColor}15` }}
                >
                  <Image className="w-6 h-6" style={{ color: purpleColor }} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium" style={{ color: textPrimary }}>
                    {t('export.png')}
                  </h4>
                  <p className="text-xs" style={{ color: textSecondary }}>
                    {language === 'id' 
                      ? 'Gambar untuk media sosial' 
                      : 'Image for social media'}
                  </p>
                </div>
                <Download className="w-5 h-5" style={{ color: textSecondary }} />
              </motion.button>

              {/* CSV Option */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition-colors"
                style={{
                  backgroundColor: isExporting && exportType === 'csv' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : bgPrimary,
                  borderColor: isExporting && exportType === 'csv' 
                    ? '#10b981' 
                    : borderColor,
                }}
              >
                <div 
                  className="p-3 rounded-xl"
                  style={{ 
                    backgroundColor: exportType === 'csv' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(16, 185, 129, 0.1)' 
                  }}
                >
                  {isExporting && exportType === 'csv' ? (
                    <Loader2 className="w-6 h-6 text-[#10b981] animate-spin" />
                  ) : exportType === 'csv' ? (
                    <CheckCircle className="w-6 h-6 text-[#10b981]" />
                  ) : (
                    <FileSpreadsheet className="w-6 h-6 text-[#10b981]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium" style={{ color: textPrimary }}>
                    {t('export.csv')}
                  </h4>
                  <p className="text-xs" style={{ color: textSecondary }}>
                    {language === 'id' 
                      ? 'Data mentah untuk analisis di Excel/Sheets' 
                      : 'Raw data for analysis in Excel/Sheets'}
                  </p>
                </div>
                <Download className="w-5 h-5" style={{ color: textSecondary }} />
              </motion.button>

              {/* PDF Option */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition-colors"
                style={{
                  backgroundColor: isExporting && exportType === 'pdf' 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : bgPrimary,
                  borderColor: isExporting && exportType === 'pdf' 
                    ? '#ef4444' 
                    : borderColor,
                }}
              >
                <div 
                  className="p-3 rounded-xl"
                  style={{ 
                    backgroundColor: exportType === 'pdf' 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(239, 68, 68, 0.1)' 
                  }}
                >
                  {isExporting && exportType === 'pdf' ? (
                    <Loader2 className="w-6 h-6 text-[#ef4444] animate-spin" />
                  ) : exportType === 'pdf' ? (
                    <CheckCircle className="w-6 h-6 text-[#ef4444]" />
                  ) : (
                    <FileText className="w-6 h-6 text-[#ef4444]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium" style={{ color: textPrimary }}>
                    {t('export.pdf')}
                  </h4>
                  <p className="text-xs" style={{ color: textSecondary }}>
                    {language === 'id' 
                      ? 'Laporan lengkap dengan ringkasan dan grafik' 
                      : 'Complete report with summary and charts'}
                  </p>
                </div>
                <Download className="w-5 h-5" style={{ color: textSecondary }} />
              </motion.button>
            </div>

            {/* Info */}
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${bgPrimary}80` }}
            >
              <p className="text-xs" style={{ color: textSecondary }}>
                <strong style={{ color: textPrimary }}>{transactions.length}</strong>{' '}
                {language === 'id' ? 'transaksi akan diexport' : 'transactions will be exported'}
                {dateRange.min && dateRange.max && (
                  <span> ({dateRange.min} - {dateRange.max})</span>
                )}
              </p>
            </div>
          </motion.div>
        ) : (
          // PNG Export Options with Preview
          <motion.div 
            key="png"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Back Button */}
            <button
              onClick={() => setShowPNGOptions(false)}
              className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: textSecondary }}
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'id' ? 'Kembali' : 'Back'}
            </button>

            {/* Orientation Picker */}
            <div>
              <p className="text-sm mb-3" style={{ color: textSecondary }}>
                {language === 'id' ? 'Pilih orientasi:' : 'Choose orientation:'}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ORIENTATIONS.map((orient) => {
                  const Icon = orient.icon;
                  const isSelected = selectedOrientation === orient.id;
                  return (
                    <motion.button
                      key={orient.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOrientation(orient.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                      style={{
                        backgroundColor: isSelected ? `${accentColor}15` : bgPrimary,
                        borderColor: isSelected ? accentColor : borderColor,
                      }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: isSelected ? accentColor : textSecondary }} 
                      />
                      <span 
                        className="text-xs font-medium"
                        style={{ color: isSelected ? accentColor : textPrimary }}
                      >
                        {orient.label[language]}
                      </span>
                      <span className="text-[10px]" style={{ color: textSecondary }}>
                        {orient.dimensions}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: textSecondary }}>
                {ORIENTATIONS.find(o => o.id === selectedOrientation)?.hint}
              </p>
            </div>

            {/* Preview */}
            <div 
              className="flex items-center justify-center p-4 rounded-xl"
              style={{ backgroundColor: bgPrimary }}
            >
              {isGeneratingPreview ? (
                <div 
                  className="flex items-center justify-center rounded-lg"
                  style={{ 
                    width: previewDims.width, 
                    height: previewDims.height,
                    backgroundColor: bgCard,
                  }}
                >
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
                </div>
              ) : previewDataUrl ? (
                <img 
                  src={previewDataUrl} 
                  alt="Preview"
                  className="rounded-lg shadow-lg"
                  style={{ 
                    width: previewDims.width, 
                    height: previewDims.height,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div 
                  className="flex items-center justify-center rounded-lg"
                  style={{ 
                    width: previewDims.width, 
                    height: previewDims.height,
                    backgroundColor: bgCard,
                    border: `1px dashed ${borderColor}`,
                  }}
                >
                  <span className="text-sm" style={{ color: textSecondary }}>
                    {language === 'id' ? 'Memuat preview...' : 'Loading preview...'}
                  </span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPNG}
              disabled={isExporting || isGeneratingPreview}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: isExporting && exportType === 'png' 
                  ? `${purpleColor}30` 
                  : purpleColor,
                color: '#ffffff',
              }}
            >
              {isExporting && exportType === 'png' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {language === 'id' ? 'Simpan Gambar' : 'Save Image'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Shareable Card for PNG generation */}
      <ShareableCard
        ref={shareableCardRef}
        summary={summary}
        categoryData={categoryData}
        topMerchants={topMerchants}
        comparison={comparison}
        dateRange={dateRange}
        orientation={selectedOrientation}
        isDark={isDark}
        language={language}
      />
    </Modal>
  );
}
