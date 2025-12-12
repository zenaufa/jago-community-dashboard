import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Check, X, Tag, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useCustomCategories } from '../../hooks/useCustomCategories';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function CategoryRulesModal({ isOpen, onClose }) {
  const { rules, addRule, updateRule, removeRule, reorderRules, resetRules } = useCustomCategories();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  
  const [editingId, setEditingId] = useState(null);
  const [newPattern, setNewPattern] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editValues, setEditValues] = useState({ pattern: '', category: '' });

  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const bgCard = isDark ? '#1a1a2e' : '#ffffff';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';
  const purpleColor = isDark ? '#a78bfa' : '#7c3aed';

  const handleAddRule = () => {
    if (!newPattern.trim() || !newCategory.trim()) {
      showToast({ 
        message: language === 'id' ? 'Pattern dan kategori harus diisi' : 'Pattern and category are required', 
        type: 'warning' 
      });
      return;
    }
    addRule(newPattern.trim(), newCategory.trim());
    setNewPattern('');
    setNewCategory('');
    setIsAddingNew(false);
    showToast({ 
      message: language === 'id' ? 'Rule berhasil ditambahkan' : 'Rule added successfully', 
      type: 'success' 
    });
  };

  const handleStartEdit = (rule) => {
    setEditingId(rule.id);
    setEditValues({ pattern: rule.pattern, category: rule.category });
  };

  const handleSaveEdit = (id) => {
    if (!editValues.pattern.trim() || !editValues.category.trim()) {
      showToast({ 
        message: language === 'id' ? 'Pattern dan kategori harus diisi' : 'Pattern and category are required', 
        type: 'warning' 
      });
      return;
    }
    updateRule(id, { pattern: editValues.pattern.trim(), category: editValues.category.trim() });
    setEditingId(null);
    showToast({ 
      message: language === 'id' ? 'Rule berhasil diupdate' : 'Rule updated successfully', 
      type: 'success' 
    });
  };

  const handleDelete = (id) => {
    removeRule(id);
    showToast({ 
      message: language === 'id' ? 'Rule berhasil dihapus' : 'Rule deleted', 
      type: 'info' 
    });
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      reorderRules(index, index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < rules.length - 1) {
      reorderRules(index, index + 1);
    }
  };

  const handleReset = () => {
    resetRules();
    showToast({ 
      message: language === 'id' ? 'Rules direset ke default' : 'Rules reset to default', 
      type: 'info' 
    });
  };

  const title = language === 'id' ? 'Aturan Kategori Kustom' : 'Custom Category Rules';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <p className="text-sm" style={{ color: textSecondary }}>
          {language === 'id' 
            ? 'Tambahkan aturan untuk mengkategorikan transaksi secara otomatis berdasarkan teks yang cocok. Aturan diproses dari atas ke bawah.'
            : 'Add rules to automatically categorize transactions based on matching text. Rules are processed from top to bottom.'}
        </p>

        {/* Rules List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ 
                  backgroundColor: `${bgPrimary}50`,
                  border: `1px solid ${borderColor}`
                }}
              >
                {/* Priority Controls */}
                <div className="flex flex-col">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70"
                    style={{ color: textSecondary }}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === rules.length - 1}
                    className="p-0.5 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70"
                    style={{ color: textSecondary }}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {editingId === rule.id ? (
                  <>
                    <input
                      type="text"
                      value={editValues.pattern}
                      onChange={(e) => setEditValues(prev => ({ ...prev, pattern: e.target.value }))}
                      placeholder="Pattern"
                      className="flex-1 px-2 py-1.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: bgCard,
                        border: `1px solid ${accentColor}`,
                        color: textPrimary
                      }}
                    />
                    <input
                      type="text"
                      value={editValues.category}
                      onChange={(e) => setEditValues(prev => ({ ...prev, category: e.target.value }))}
                      placeholder={language === 'id' ? 'Kategori' : 'Category'}
                      className="w-32 px-2 py-1.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: bgCard,
                        border: `1px solid ${accentColor}`,
                        color: textPrimary
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(rule.id)}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: '#10b981' }}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: textSecondary }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <code 
                        className="text-sm px-2 py-0.5 rounded"
                        style={{ 
                          color: accentColor,
                          backgroundColor: `${accentColor}15`
                        }}
                      >
                        {rule.pattern}
                      </code>
                    </div>
                    <div 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${purpleColor}15` }}
                    >
                      <Tag className="w-3 h-3" style={{ color: purpleColor }} />
                      <span className="text-xs" style={{ color: purpleColor }}>{rule.category}</span>
                    </div>
                    <button
                      onClick={() => handleStartEdit(rule)}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: textSecondary }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {rules.length === 0 && (
            <div className="text-center py-8" style={{ color: textSecondary }}>
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === 'id' ? 'Belum ada aturan kategori' : 'No category rules yet'}
              </p>
            </div>
          )}
        </div>

        {/* Add New Rule */}
        <AnimatePresence>
          {isAddingNew ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div 
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ 
                  backgroundColor: `${accentColor}08`,
                  border: `1px solid ${accentColor}30`
                }}
              >
                <input
                  type="text"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder={language === 'id' ? 'Pattern (contoh: STARBUCKS)' : 'Pattern (e.g., STARBUCKS)'}
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ 
                    backgroundColor: bgPrimary,
                    border: `1px solid ${borderColor}`,
                    color: textPrimary
                  }}
                  autoFocus
                />
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={language === 'id' ? 'Kategori' : 'Category'}
                  className="w-32 px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ 
                    backgroundColor: bgPrimary,
                    border: `1px solid ${borderColor}`,
                    color: textPrimary
                  }}
                />
                <button
                  onClick={handleAddRule}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewPattern('');
                    setNewCategory('');
                  }}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: borderColor, color: textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-colors"
              style={{ 
                borderColor: borderColor,
                color: textSecondary
              }}
            >
              <Plus className="w-4 h-4" />
              {language === 'id' ? 'Tambah Aturan Baru' : 'Add New Rule'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div 
          className="flex justify-between pt-2"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-70"
            style={{ color: textSecondary }}
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'id' ? 'Reset ke Default' : 'Reset to Default'}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: accentColor, color: isDark ? '#0f0f0f' : '#ffffff' }}
          >
            {language === 'id' ? 'Selesai' : 'Done'}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
