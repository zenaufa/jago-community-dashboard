import { useTheme } from '../../context/ThemeContext';

export function Skeleton({ className = '', style = {} }) {
  const { isDark } = useTheme();
  const bgColor = isDark ? '#2a2a4e' : '#e2e8f0';
  
  return (
    <div 
      className={`rounded skeleton-pulse ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    />
  );
}

export function SkeletonCard() {
  const { isDark } = useTheme();
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const bgGradient = isDark 
    ? 'linear-gradient(to bottom right, rgba(26,26,46,0.5), rgba(22,33,62,0.5))'
    : 'linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(248,250,252,0.5))';
  
  return (
    <div 
      className="rounded-xl p-5"
      style={{ border: `1px solid ${borderColor}`, background: bgGradient }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function SkeletonChart() {
  const { isDark } = useTheme();
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const bgGradient = isDark 
    ? 'linear-gradient(to bottom right, rgba(26,26,46,0.5), rgba(22,33,62,0.5))'
    : 'linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(248,250,252,0.5))';
  
  return (
    <div 
      className="rounded-xl p-5"
      style={{ border: `1px solid ${borderColor}`, background: bgGradient }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <div className="h-[300px] flex items-end gap-2 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1">
            <Skeleton 
              className="w-full rounded-t" 
              style={{ height: `${Math.random() * 60 + 20}%` }} 
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  const { isDark } = useTheme();
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const bgGradient = isDark 
    ? 'linear-gradient(to bottom right, rgba(26,26,46,0.5), rgba(22,33,62,0.5))'
    : 'linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(248,250,252,0.5))';
  
  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${borderColor}`, background: bgGradient }}
    >
      <div 
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 py-3 last:border-0"
            style={{ borderBottom: `1px solid ${borderColor}30` }}
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40 flex-1" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  const { isDark } = useTheme();
  const bgPrimary = isDark ? '#0f0f0f' : '#f8fafc';
  const borderColor = isDark ? '#2a2a4e' : '#e2e8f0';
  const headerBg = isDark 
    ? 'linear-gradient(to right, #1a1a2e, #16213e)'
    : 'linear-gradient(to right, #ffffff, #f8fafc)';
  const bgGradient = isDark 
    ? 'linear-gradient(to bottom right, rgba(26,26,46,0.5), rgba(22,33,62,0.5))'
    : 'linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(248,250,252,0.5))';
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: bgPrimary }}>
      {/* Header Skeleton */}
      <header style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-20 mb-1 ml-auto" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Chart */}
        <SkeletonChart />

        {/* Category and Merchants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div 
            className="rounded-xl p-5"
            style={{ border: `1px solid ${borderColor}`, background: bgGradient }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex justify-center py-8">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </div>
          </div>
          <div 
            className="rounded-xl p-5"
            style={{ border: `1px solid ${borderColor}`, background: bgGradient }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <SkeletonTable />
      </main>
    </div>
  );
}
