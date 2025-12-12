import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { parseJagoPDF, transactionsToCSV } from '../../utils/jagoPdfParser';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function UploadModal({ isOpen, onClose, onUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  
  // Theme colors
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (droppedFile) => {
    const name = droppedFile.name.toLowerCase();
    return name.endsWith('.pdf');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    } else {
      setError(t('upload.pdfOnly'));
    }
  }, [t]);

  const handleFileSelect = useCallback((e) => {
    setError(null);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setError(t('upload.pdfOnly'));
      }
    }
  }, [t]);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const transactions = await parseJagoPDF(file, (progressInfo) => {
        setProgress(progressInfo);
      });
      const csvText = transactionsToCSV(transactions);

      await onUpload(csvText);
      const msg = language === 'id' 
        ? `${transactions.length} transaksi berhasil dimuat!`
        : `${transactions.length} transactions loaded successfully!`;
      showToast({ message: msg, type: 'success' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process file');
      showToast({ message: 'Upload failed: ' + err.message, type: 'error' });
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setProgress(null);
  };

  const getProgressText = () => {
    if (!progress) return t('upload.processing');
    
    if (progress.phase === 'extracting') {
      return `${t('upload.extracting')} ${progress.current}/${progress.total}...`;
    }
    if (progress.phase === 'stitching') {
      return t('upload.stitching');
    }
    if (progress.phase === 'parsing') {
      if (progress.current !== undefined) {
        return `${t('upload.parsing')} ${progress.current}/${progress.total}...`;
      }
      return `${t('upload.parsing')}...`;
    }
    if (progress.message) {
      return progress.message;
    }
    return t('upload.processing');
  };

  const howToSteps = language === 'id' 
    ? [
        { label: 'Jago', text: 'Buka aplikasi' },
        { label: 'Transaksi', text: 'Pilih menu' },
        { label: 'Riwayat', text: 'atau' },
        { label: 'Download', text: 'Tap tombol' },
        { label: '', text: 'Pilih rentang waktu yang diinginkan' },
      ]
    : [
        { label: 'Jago', text: 'Open the' },
        { label: 'Transactions', text: 'Select the' },
        { label: 'History', text: 'or' },
        { label: 'Download', text: 'Tap the' },
        { label: '', text: 'Choose your desired date range' },
      ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('upload.title')} size="md">
      <div className="space-y-4">
        <p className="text-sm" style={{ color: textSecondary }}>
          {t('upload.description')}
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer"
          style={{
            borderColor: isDragOver ? accentColor : file ? '#10b981' : borderColor,
            backgroundColor: isDragOver ? `${accentColor}08` : file ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
          }}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            {file ? (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <FileText className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: textPrimary }}>{file.name}</p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="mt-2 text-xs hover:underline flex items-center gap-1 mx-auto"
                  style={{ color: '#ef4444' }}
                >
                  <X className="w-3 h-3" />
                  {t('upload.remove')}
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: `${accentColor}15` }}>
                  <Upload className="w-6 h-6" style={{ color: accentColor }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: textPrimary }}>
                  {t('upload.dropzone')}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {t('upload.dropzoneHint')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {isUploading && (
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
              <p className="text-sm" style={{ color: accentColor }}>{getProgressText()}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* How to get PDF */}
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${bgPrimary}80` }}>
          <p className="text-xs mb-2" style={{ color: textSecondary }}>
            <strong style={{ color: textPrimary }}>{t('empty.howTo')}:</strong>
          </p>
          <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: textSecondary }}>
            <li>{language === 'id' ? 'Buka aplikasi' : 'Open the'} <span style={{ color: accentColor }}>Jago</span></li>
            <li>{language === 'id' ? 'Pilih menu' : 'Select'} <span style={{ color: textPrimary }}>{language === 'id' ? 'Transaksi' : 'Transactions'}</span> {language === 'id' ? 'atau' : 'or'} <span style={{ color: textPrimary }}>{language === 'id' ? 'Riwayat' : 'History'}</span></li>
            <li>{language === 'id' ? 'Tap tombol' : 'Tap'} <span style={{ color: textPrimary }}>Download</span> {language === 'id' ? 'atau' : 'or'} <span style={{ color: textPrimary }}>Export PDF</span></li>
            <li>{language === 'id' ? 'Pilih rentang waktu yang diinginkan' : 'Choose your desired date range'}</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-colors"
            style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}`, color: textSecondary }}
          >
            {t('upload.cancel')}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ 
              backgroundColor: file && !isUploading ? accentColor : borderColor,
              color: file && !isUploading ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary,
              cursor: file && !isUploading ? 'pointer' : 'not-allowed'
            }}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('upload.processing')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {t('upload.submit')}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
