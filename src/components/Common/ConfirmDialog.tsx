import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={!isLoading ? onCancel : undefined}
    >
      <div
        id="confirm-dialog-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E0E0D5] p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              confirmVariant === 'danger'
                ? 'bg-[#F9ECEB] text-[#8C3A35]'
                : confirmVariant === 'warning'
                ? 'bg-[#FDF8EE] text-[#7A5A30]'
                : 'bg-[#ECECE4] text-[#5A5A40]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-[#3D3D2D] tracking-tight"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-sm text-[#8A8A7A] mt-1 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F0E5]">
          <button
            id="btn-confirm-cancel"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F0F0E5] rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-proceed"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs ${
              confirmVariant === 'danger'
                ? 'bg-[#8C3A35] hover:bg-[#782E2A] text-white'
                : confirmVariant === 'warning'
                ? 'bg-[#7A5A30] hover:bg-[#684A25] text-white'
                : 'bg-[#5A5A40] hover:bg-[#4A4A35] text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
