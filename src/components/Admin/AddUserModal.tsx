import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addUserApi } from '../../services/api';
import { X, UserPlus, Loader2, User, Lock, Shield } from 'lucide-react';
import { UserRole } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (!token) {
      showError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addUserApi(token, trimmedName, password, role);
      if (res && res.success === false) {
        throw new Error(res.message || res.error || 'Failed to add user.');
      }
      showSuccess(`User "${trimmedName}" created successfully.`);
      setName('');
      setPassword('');
      setRole('user');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
      showError(err.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-user-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-user-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E0E0D5] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0F0E5] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-lg flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="add-user-modal-title"
                className="text-lg font-bold text-[#3D3D2D] tracking-tight"
              >
                Add New User
              </h2>
              <p className="text-xs text-[#8A8A7A]">
                Create user credentials and assign role
              </p>
            </div>
          </div>
          <button
            id="btn-close-add-user"
            onClick={onClose}
            className="text-[#A0A090] hover:text-[#5A5A40] p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div
              id="add-user-error-alert"
              className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="add-user-name"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="add-user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. john.doe"
                required
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="add-user-password"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="add-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="add-user-role"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <Shield className="w-4 h-4" />
              </div>
              <select
                id="add-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="user">User (Standard Access)</option>
                <option value="editor">Editor (Editor Access)</option>
                <option value="admin">Admin (Full Management Access)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F0E5]">
            <button
              id="btn-cancel-add-user"
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F0F0E5] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-user"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create User</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
