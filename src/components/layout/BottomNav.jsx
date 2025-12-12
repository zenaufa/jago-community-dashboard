import { Download, Upload, Eye, EyeOff, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function BottomNav({ isHidden, onToggleHidden, onOpenExport, onOpenUpload, onClear }) {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  
  // Theme colors
  const bgNav = isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const dangerColor = '#ef4444';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg safe-area-bottom block md:hidden"
      style={{ backgroundColor: bgNav, borderTop: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {/* Toggle Hidden */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleHidden}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          {isHidden ? (
            <EyeOff className="w-5 h-5" style={{ color: textSecondary }} />
          ) : (
            <Eye className="w-5 h-5" style={{ color: accentColor }} />
          )}
          <span className="text-[10px]" style={{ color: textSecondary }}>
            {isHidden 
              ? (language === 'id' ? 'Tampilkan' : 'Show') 
              : (language === 'id' ? 'Sembunyikan' : 'Hide')}
          </span>
        </motion.button>

        {/* Upload */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenUpload}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          <Upload className="w-5 h-5" style={{ color: textSecondary }} />
          <span className="text-[10px]" style={{ color: textSecondary }}>Upload</span>
        </motion.button>

        {/* Export */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenExport}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          <Download className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-[10px]" style={{ color: accentColor }}>Export</span>
        </motion.button>

        {/* Clear Data */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="flex flex-col items-center gap-1 px-3 py-1"
        >
          <Trash2 className="w-5 h-5" style={{ color: dangerColor }} />
          <span className="text-[10px]" style={{ color: dangerColor }}>
            {language === 'id' ? 'Hapus' : 'Clear'}
          </span>
        </motion.button>
      </div>
    </nav>
  );
}
