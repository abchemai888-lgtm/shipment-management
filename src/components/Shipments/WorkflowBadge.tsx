import { displayVal } from '../../utils/formatters';

interface WorkflowBadgeProps {
  label: string;
  value?: string | null;
  compact?: boolean;
}

export default function WorkflowBadge({ label, value, compact = false }: WorkflowBadgeProps) {
  const displayed = displayVal(value);
  const isEmpty = displayed === '--';

  const normalized = String(value || '').trim().toLowerCase();
  const isPositive = normalized === 'done' || normalized === 'approved';
  const isPending = normalized === 'pending';
  const isNegative = normalized === 'non approved';

  const getCompactStyles = () => {
    if (isEmpty) return 'bg-[#F9F9F6] text-[#8A8A7A] border-[#E5E5DA]';
    if (isPositive) return 'bg-[#F2F6ED] text-[#344C20] border-[#BCD1A8]';
    if (isPending) return 'bg-[#FDF8EE] text-[#785412] border-[#EFE0C2]';
    if (isNegative) return 'bg-[#FDF2F2] text-[#842323] border-[#F4C7C7]';
    return 'bg-[#F5F5F0] text-[#5A5A40] border-[#E0E0D5]';
  };

  const getFullStyles = () => {
    if (isEmpty) return 'bg-[#FBFBF8] border-[#E8E8DD] text-[#7A7A6A]';
    if (isPositive) return 'bg-[#F2F6ED] border-[#BCD1A8] text-[#344C20]';
    if (isPending) return 'bg-[#FDF8EE] border-[#EFE0C2] text-[#785412]';
    if (isNegative) return 'bg-[#FDF2F2] border-[#F4C7C7] text-[#842323]';
    return 'bg-[#F5F5F0] border-[#E0E0D5] text-[#5A5A40]';
  };

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getCompactStyles()}`}
        title={`${label}: ${displayed}`}
      >
        <span className="font-semibold text-[10px] opacity-80">{label}:</span>
        <span className={isEmpty ? 'text-[#A0A090]' : 'font-semibold'}>{displayed}</span>
      </span>
    );
  }

  return (
    <div
      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-colors ${getFullStyles()}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
        {label}
      </span>
      <span className="text-xs font-semibold break-words">
        {displayed}
      </span>
    </div>
  );
}

