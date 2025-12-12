import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();

  // Theme colors
  const accentColor = isDark ? '#ffe600' : '#ca8a04';
  const bgColor = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-40 p-3 rounded-full shadow-lg transition-all"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
              : '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
          whileHover={{ 
            scale: 1.1,
            backgroundColor: accentColor,
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to top"
        >
          <ArrowUp 
            className="w-5 h-5 transition-colors" 
            style={{ color: accentColor }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

