import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const iconMap = {
  success: { icon: CheckCircle, color: '#10b981', bg: 'bg-emerald-500/10' },
  error: { icon: AlertCircle, color: '#ef4444', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: '#00d9ff', bg: 'bg-cyan-500/10' },
};

export function Toast({ message, type = 'info', exiting, onDismiss }) {
  const { icon: Icon, color, bg } = iconMap[type] || iconMap.info;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-[#1a1a2e] border border-[#2a2a4e]
        shadow-xl shadow-black/20
        ${exiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <div className={`p-1.5 rounded-lg ${bg}`}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-sm text-[#e4e4e7] flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="p-1 rounded-md hover:bg-[#2a2a4e] transition-colors"
      >
        <X className="w-4 h-4 text-[#a1a1aa]" />
      </button>
    </div>
  );
}

