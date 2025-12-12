import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  // Theme colors
  const bgGradient = isDark 
    ? 'linear-gradient(to bottom right, #1a1a2e, #16213e)'
    : 'linear-gradient(to bottom right, #ffffff, #f8fafc)';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const hoverBg = isDark ? '#2a2a4e' : '#f1f5f9';

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${sizeClasses[size]} rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden`}
            style={{ 
              background: bgGradient,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <h2 
                className="text-lg font-semibold" 
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: textPrimary }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
