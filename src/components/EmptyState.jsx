import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Shield, TrendingUp, PieChart, Lock, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import { parseJagoPDF, transactionsToCSV } from '../utils/jagoPdfParser';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function EmptyState({ onUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  // Theme-aware colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f8fafc';
  const bgSecondary = isDark ? '#1a1a2e' : '#ffffff';
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const textMuted = isDark ? '#71717a' : '#94a3b8';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const positiveColor = isDark ? '#10b981' : '#059669';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.pdf')) {
      await processFile(file);
    } else {
      setError(t('upload.pdfOnly'));
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      const transactions = await parseJagoPDF(file, (progressInfo) => {
        setProgress(progressInfo);
      });
      const csvText = transactionsToCSV(transactions);
      
      const blob = new Blob([csvText], { type: 'text/csv' });
      const csvFile = new File([blob], 'transactions.csv', { type: 'text/csv' });
      await onUpload(csvFile);
    } catch (err) {
      setError(err.message || 'Failed to process PDF file');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
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
    return progress.message || t('upload.processing');
  };

  return (
    <div className="min-h-screen flex flex-col theme-transition" style={{ backgroundColor: bgPrimary }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" 
             style={{ backgroundColor: `${accentColor}10` }} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl"
             style={{ backgroundColor: `${purpleColor}08` }} />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full blur-3xl"
             style={{ backgroundColor: `${positiveColor}08` }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b theme-transition" style={{ borderColor, backgroundColor: bgSecondary }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}
              whileHover={{ scale: 1.05 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }}>
                <path 
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span style={{ color: accentColor }}>{t('app.title')}</span>{' '}
                <span style={{ color: textPrimary }}>{t('app.subtitle')}</span>
              </h1>
              <p className="text-xs" style={{ color: textMuted }}>{t('app.unofficial')} • Open Source</p>
            </div>
          </div>
          
          {/* Toggles */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleLanguage}
              className="flex items-center rounded-lg text-xs font-medium overflow-hidden"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <span 
                className="px-2 py-1.5 transition-colors"
                style={{ 
                  backgroundColor: language === 'id' ? accentColor : 'transparent',
                  color: language === 'id' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                }}
              >
                ID
              </span>
              <span 
                className="px-2 py-1.5 transition-colors"
                style={{ 
                  backgroundColor: language === 'en' ? accentColor : 'transparent',
                  color: language === 'en' ? (isDark ? '#0f0f0f' : '#ffffff') : textSecondary
                }}
              >
                EN
              </span>
            </motion.button>
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${accentColor}15`,
                color: accentColor 
              }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg w-full"
        >
          {/* Hero Section */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${isDark ? '#e6cf00' : '#a16207'} 100%)` }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{ 
                boxShadow: [
                  `0 0 20px ${accentColor}30`,
                  `0 0 40px ${accentColor}20`,
                  `0 0 20px ${accentColor}30`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-10 h-10" style={{ color: isDark ? '#0f0f0f' : '#ffffff' }} />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold mb-3" 
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}>
              {t('empty.title')}{' '}
              <span style={{ color: accentColor }}>{t('app.title')}</span>
            </h2>
            <p style={{ color: textSecondary }} className="max-w-md mx-auto">
              {t('empty.subtitle')}
            </p>
          </div>

          {/* Upload Area */}
          <motion.div
            whileHover={{ scale: isProcessing ? 1 : 1.01 }}
            className="relative mb-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div 
              className="border-2 border-dashed rounded-2xl p-8 transition-all"
              style={{
                backgroundColor: `${bgCard}50`,
                borderColor: isDragOver ? accentColor : borderColor,
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              {isProcessing ? (
                <div className="text-center">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <FileText className="w-7 h-7" style={{ color: accentColor }} />
                  </motion.div>
                  <p className="font-medium mb-1" style={{ color: textPrimary }}>{getProgressText()}</p>
                  <p className="text-sm" style={{ color: textSecondary }}>
                    {language === 'id' ? 'Mohon tunggu sebentar...' : 'Please wait...'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: `${accentColor}15` }}>
                    <Upload className="w-7 h-7" style={{ color: accentColor }} />
                  </div>
                  <p className="font-medium mb-1" style={{ color: textPrimary }}>
                    {t('empty.dropzone')}
                  </p>
                  <p className="text-sm" style={{ color: textSecondary }}>
                    {t('empty.dropzoneHint')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            </motion.div>
          )}

          {/* How to get PDF - Collapsible */}
          <div className="mb-6">
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors"
              style={{ backgroundColor: `${bgCard}50`, border: `1px solid ${borderColor}` }}
            >
              <span className="text-sm" style={{ color: textSecondary }}>{t('empty.howTo')}</span>
              {showHowTo ? (
                <ChevronUp className="w-4 h-4" style={{ color: textSecondary }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: textSecondary }} />
              )}
            </button>
            
            <AnimatePresence>
              {showHowTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-x border-b rounded-b-xl" style={{ backgroundColor: `${bgCard}30`, borderColor }}>
                    <ol className="text-sm space-y-2" style={{ color: textSecondary }}>
                      {[1, 2, 3, 4, 5].map(num => (
                        <li key={num} className="flex gap-2">
                          <span 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                          >
                            {num}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: t(`empty.step${num}`).replace(/Jago|Profil|Riwayat Transaksi|Download|Profile|Transaction History/g, '<strong style="color: ' + textPrimary + '">$&</strong>') }} />
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: `${bgCard}30`, border: `1px solid ${borderColor}` }}>
              <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: positiveColor }} />
              <p className="text-xs" style={{ color: textSecondary }}>{t('empty.feature1')}</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: `${bgCard}30`, border: `1px solid ${borderColor}` }}>
              <PieChart className="w-5 h-5 mx-auto mb-2" style={{ color: purpleColor }} />
              <p className="text-xs" style={{ color: textSecondary }}>{t('empty.feature2')}</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: `${bgCard}30`, border: `1px solid ${borderColor}` }}>
              <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: accentColor }} />
              <p className="text-xs" style={{ color: textSecondary }}>{t('empty.feature3')}</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: `${positiveColor}08`, border: `1px solid ${positiveColor}30` }}>
            <div className="flex gap-3">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: positiveColor }} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: positiveColor }}>{t('empty.privacy')}</p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {t('empty.privacyDesc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t py-4 theme-transition" style={{ borderColor }}>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs" style={{ color: textMuted }}>
            {t('app.title')} {t('app.subtitle')} • {t('footer.disclaimer')}
          </p>
          <p className="text-xs" style={{ color: textMuted }}>
            © 2025 <a href="https://github.com/Linaqruf" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: textSecondary }}>Linaqruf</a>. Licensed under Apache 2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
