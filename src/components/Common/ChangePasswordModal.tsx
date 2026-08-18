import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Loader2, KeyRound } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetUserName?: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}: ChangePasswordModalProps) {
  const { user, changeUserPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const userId = targetUserId || user?.user_id || '';
  const displayName = targetUserName || user?.name || 'Account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const success = await changeUserPassword(userId, newPassword);
    setIsSubmitting(false);

    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <div
      id="change-password-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="change-password-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E0E0D5] overflow-hidden my-8"
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0F0E5] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-lg flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="change-password-modal-title"
                className="text-lg font-bold text-[#3D3D2D] tracking-tight"
              >
                Change Password
              </h2>
              <p className="text-xs text-[#8A8A7A]">For user: {displayName}</p>
            </div>
          </div>
          <button
            id="change-password-modal-close-btn"
            onClick={onClose}
            className="text-[#A0A090] hover:text-[#5A5A40] p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div
              id="change-password-error"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="modal-new-password"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="modal-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-confirm-password"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="modal-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F0E5]">
            <button
              id="change-password-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F0F0E5] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="change-password-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
