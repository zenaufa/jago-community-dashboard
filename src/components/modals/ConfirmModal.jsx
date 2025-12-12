import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';

  // Variant colors
  const variantColors = {
    danger: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: '#ef4444',
      button: '#ef4444',
      buttonHover: '#dc2626',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: '#f59e0b',
      button: '#f59e0b',
      buttonHover: '#d97706',
    },
    info: {
      bg: isDark ? 'rgba(0, 217, 255, 0.1)' : 'rgba(8, 145, 178, 0.1)',
      border: isDark ? 'rgba(0, 217, 255, 0.3)' : 'rgba(8, 145, 178, 0.3)',
      icon: isDark ? '#00d9ff' : '#0891b2',
      button: isDark ? '#00d9ff' : '#0891b2',
      buttonHover: isDark ? '#00b8d9' : '#0e7490',
    },
  };

  const colors = variantColors[variant];

  const defaultTitle = language === 'id' ? 'Konfirmasi' : 'Confirm';
  const defaultConfirmText = language === 'id' ? 'Ya, Lanjutkan' : 'Yes, Continue';
  const defaultCancelText = language === 'id' ? 'Batal' : 'Cancel';

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || defaultTitle} size="sm">
      <div className="space-y-4">
        {/* Icon and Message */}
        <div 
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
          <p className="text-sm" style={{ color: textSecondary }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-colors"
            style={{ 
              backgroundColor: bgPrimary, 
              border: `1px solid ${borderColor}`,
              color: textSecondary 
            }}
          >
            {cancelText || defaultCancelText}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: colors.button,
              color: '#ffffff'
            }}
          >
            {confirmText || defaultConfirmText}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

