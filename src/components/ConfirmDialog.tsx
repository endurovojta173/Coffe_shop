import React, { useEffect } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Smazat',
  cancelLabel = 'Zrušit',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm bg-[#2D221A] border border-[#3E3025] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-[#D96B6B]/15 border-[#D96B6B]/40 text-[#D96B6B]'
                  : 'bg-[#D89D60]/15 border-[#D89D60]/40 text-[#D89D60]'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3
              id="confirm-dialog-title"
              className="font-serif-heading text-lg font-bold text-[#F5EBE1] leading-snug"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            aria-label="Zavřít"
            className="p-1.5 rounded-full text-[#A39284] hover:text-[#F5EBE1] hover:bg-[#221912] transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#A39284] leading-relaxed">{description}</p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="py-3 px-4 rounded-full bg-[#221912] border border-[#3E3025] hover:border-[#A39284] text-sm font-medium text-[#A39284] hover:text-[#F5EBE1] transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-[#D96B6B] hover:bg-[#e27a7a] text-[#1C140D]'
                : 'bg-[#D89D60] hover:bg-[#e3aa6e] text-[#1C140D]'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
