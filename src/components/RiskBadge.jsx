/**
 * Risk level badge component with Deloitte risk framework colors.
 */
export default function RiskBadge({ level, score, size = 'md' }) {
  const configs = {
    critical: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', label: 'CRITICAL', dot: '#C0392B' },
    high:     { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600', label: 'HIGH', dot: '#E67E22' },
    medium:   { bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500', label: 'MEDIUM', dot: '#F1C40F' },
    low:      { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700', label: 'LOW', dot: '#27AE60' },
    unknown:  { bg: 'bg-gray-400', text: 'text-white', border: 'border-gray-500', label: 'UNKNOWN', dot: '#999' },
  };

  const cfg = configs[level?.toLowerCase()] || configs.unknown;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-2' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-sm border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass} tracking-wider`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-70 font-normal ml-0.5">({score})</span>
      )}
    </span>
  );
}
