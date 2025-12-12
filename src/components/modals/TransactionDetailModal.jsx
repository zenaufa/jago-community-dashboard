import { motion } from 'motion/react';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Hash,
  Clock,
  Wallet,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../utils/dataProcessor';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export function TransactionDetailModal({ isOpen, onClose, transaction, isHidden }) {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // Theme colors
  const bgPrimary = isDark ? '#0f0f0f' : '#f1f5f9';
  const textPrimary = isDark ? '#e4e4e7' : '#1e293b';
  const textSecondary = isDark ? '#a1a1aa' : '#64748b';
  const accentColor = isDark ? '#00d9ff' : '#0891b2';

  if (!transaction) return null;

  const isIncome = transaction.amount >= 0;
  const amountColor = isIncome ? '#10b981' : '#ef4444';

  const formatDateTime = (datetime) => {
    if (!datetime) return { date: '-', time: '-' };
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const dateTime = formatDateTime(transaction.datetime);

  const DetailRow = ({ icon: Icon, label, value, valueColor, isMono = false, isBlurred = false }) => (
    <div 
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ backgroundColor: bgPrimary }}
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: textSecondary }}>{label}</p>
        <p 
          className={`text-sm font-medium break-words ${isBlurred ? 'blur-sm select-none' : ''}`}
          style={{ 
            color: valueColor || textPrimary,
            fontFamily: isMono ? 'JetBrains Mono, monospace' : 'inherit'
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  const title = language === 'id' ? 'Detail Transaksi' : 'Transaction Details';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {/* Amount Hero */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6 rounded-xl"
          style={{ 
            background: `linear-gradient(135deg, ${amountColor}15 0%, ${amountColor}05 100%)`,
            border: `1px solid ${amountColor}30`
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isIncome ? (
              <ArrowUpRight className="w-6 h-6" style={{ color: amountColor }} />
            ) : (
              <ArrowDownRight className="w-6 h-6" style={{ color: amountColor }} />
            )}
            <span className="text-sm font-medium" style={{ color: amountColor }}>
              {isIncome 
                ? (language === 'id' ? 'Pemasukan' : 'Income')
                : (language === 'id' ? 'Pengeluaran' : 'Expense')}
            </span>
          </div>
          <p 
            className={`text-3xl font-bold ${isHidden ? 'blur-md select-none' : ''}`}
            style={{ color: amountColor, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {isHidden ? 'Rp ••••••••' : `${isIncome ? '+' : ''}${formatCurrency(transaction.amount)}`}
          </p>
        </motion.div>

        {/* Transaction Details */}
        <div className="space-y-2">
          <DetailRow 
            icon={Building2}
            label={language === 'id' ? 'Sumber/Tujuan' : 'Source/Destination'}
            value={transaction.source || '-'}
          />
          
          <DetailRow 
            icon={Calendar}
            label={language === 'id' ? 'Tanggal' : 'Date'}
            value={dateTime.date}
          />
          
          <DetailRow 
            icon={Clock}
            label={language === 'id' ? 'Waktu' : 'Time'}
            value={dateTime.time}
            isMono
          />
          
          <DetailRow 
            icon={Wallet}
            label={language === 'id' ? 'Saldo Setelah' : 'Balance After'}
            value={isHidden ? 'Rp ••••••••' : formatCurrency(transaction.balance)}
            isMono
            isBlurred={isHidden}
          />
          
          {transaction.transaction_id && (
            <DetailRow 
              icon={Hash}
              label={language === 'id' ? 'ID Transaksi' : 'Transaction ID'}
              value={transaction.transaction_id}
              isMono
            />
          )}
        </div>

        {/* Reversal Warning */}
        {transaction.isReversal && (
          <div 
            className="p-3 rounded-xl flex items-center gap-2"
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <span className="text-sm" style={{ color: '#f59e0b' }}>
              {language === 'id' 
                ? '⚠️ Ini adalah transaksi reversal/koreksi'
                : '⚠️ This is a reversal/correction transaction'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
