import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminUser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getUsersApi,
  setUserStatusApi,
  deleteUserApi,
  getCachedUsers,
} from '../../services/api';
import AddUserModal from './AddUserModal';
import ConfirmDialog from './ConfirmDialog';
import ChangePasswordModal from '../Common/ChangePasswordModal';
import {
  UserPlus,
  RotateCw,
  Search,
  KeyRound,
  Trash2,
  Power,
  Shield,
  User as UserIcon,
  AlertCircle,
  X,
} from 'lucide-react';

export default function UsersView() {
  const { token, user: currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<AdminUser[]>(() => getCachedUsers() || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !getCachedUsers());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<AdminUser | null>(null);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant: 'danger' | 'warning' | 'primary';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    confirmVariant: 'danger',
    action: async () => {},
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = useCallback(
    async (isManual = false) => {
      if (!token || !isAdmin) return;

      const hasCached = (getCachedUsers()?.length ?? 0) > 0 || users.length > 0;

      if (isManual) {
        setIsRefreshing(true);
      } else if (!hasCached) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getUsersApi(token, isManual);
        setUsers(data);
        setLastRefreshed(new Date());
      } catch (err: any) {
        const msg = err.message || 'Failed to load users list.';
        if (!hasCached) {
          setError(msg);
        }
        showError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, isAdmin, showError, users.length]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const idMatch = (u.user_id || '').toLowerCase().includes(q);
      const nameMatch = (u.name || '').toLowerCase().includes(q);
      const roleMatch = (u.role || '').toLowerCase().includes(q);
      return idMatch || nameMatch || roleMatch;
    });
  }, [users, searchQuery]);

  // Toggle user status (Enable / Disable)
  const handleToggleStatus = (targetUser: AdminUser) => {
    if (!token) return;

    const isCurrentActive = targetUser.active;
    const newStatus = !isCurrentActive;

    if (isCurrentActive) {
      // Disabling requires confirmation
      setConfirmDialog({
        isOpen: true,
        title: 'Disable User Account',
        message: `Are you sure you want to disable "${targetUser.name}"? They will not be able to log in until re-enabled.`,
        confirmLabel: 'Disable User',
        confirmVariant: 'warning',
        action: async () => {
          setIsActionLoading(true);
          try {
            const res = await setUserStatusApi(token, targetUser.user_id, false);
            if (res && res.success === false) {
              throw new Error(res.message || res.error || 'Failed to disable user');
            }
            showSuccess(`User "${targetUser.name}" disabled.`);
            fetchUsers(true);
          } catch (err: any) {
            showError(err.message || 'Failed to disable user.');
          } finally {
            setIsActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else {
      // Enabling directly or with simple confirmation
      const enableUserAction = async () => {
        setIsActionLoading(true);
        try {
          const res = await setUserStatusApi(token, targetUser.user_id, true);
          if (res && res.success === false) {
            throw new Error(res.message || res.error || 'Failed to enable user');
          }
          showSuccess(`User "${targetUser.name}" activated.`);
          fetchUsers(true);
        } catch (err: any) {
          showError(err.message || 'Failed to activate user.');
        } finally {
          setIsActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      };

      enableUserAction();
    }
  };

  // Delete user
  const handleDeleteUser = (targetUser: AdminUser) => {
    if (!token) return;

    if (currentUser && (targetUser.user_id === currentUser.user_id || targetUser.name === currentUser.name)) {
      showError('You cannot delete your own currently logged-in admin account.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.user_id})? This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      confirmVariant: 'danger',
      action: async () => {
        setIsActionLoading(true);
        try {
          const res = await deleteUserApi(token, targetUser.user_id);
          if (res && res.success === false) {
            throw new Error(res.message || res.error || 'Failed to delete user');
          }
          showSuccess(`User "${targetUser.name}" deleted successfully.`);
          fetchUsers(true);
        } catch (err: any) {
          showError(err.message || 'Failed to delete user.');
        } finally {
          setIsActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (!isAdmin) {
    return (
      <div
        id="unauthorized-access-panel"
        className="bg-white border border-[#ECC8C5] rounded-xl p-8 text-center max-w-lg mx-auto mt-10 shadow-xs"
      >
        <AlertCircle className="w-10 h-10 text-[#8C3A35] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#3D3D2D] mb-1">Access Denied</h2>
        <p className="text-sm text-[#8A8A7A]">
          You do not have administrative permissions to view or manage user accounts.
        </p>
      </div>
    );
  }

  return (
    <div id="users-view-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            id="users-view-heading"
            className="text-xl sm:text-2xl font-bold text-[#3D3D2D] tracking-tight"
          >
            User Management
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8A8A7A] mt-1">
            <span>
              {users.length} total user{users.length === 1 ? '' : 's'}
            </span>
            {lastRefreshed && (
              <>
                <span>•</span>
                <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right Buttons: Refresh & Add User */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-refresh-users"
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#5A5A40] bg-[#FBFBF8] hover:bg-[#F5F5F0] border border-[#E0E0D5] rounded-lg transition-colors disabled:opacity-50 shadow-2xs"
            title="Refresh users list"
          >
            <RotateCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5A5A40]' : 'text-[#5A5A40]'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="btn-add-user"
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#5A5A40] hover:bg-[#4A4A35] rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div
        id="users-filter-toolbar"
        className="bg-white border border-[#E0E0D5] rounded-xl p-3.5 shadow-2xs flex gap-3"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-user-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, ID, or role..."
            className="w-full pl-9 pr-8 py-2 bg-[#FBFBF8] border border-[#E0E0D5] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#A0A090] focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A090] hover:text-[#5A5A40]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Error & Loading States */}
      {error && users.length === 0 ? (
        <div
          id="users-error-state"
          className="bg-white border border-[#ECC8C5] rounded-xl p-8 text-center"
        >
          <AlertCircle className="w-10 h-10 text-[#8C3A35] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#3D3D2D] mb-1">
            Unable to load user accounts
          </h3>
          <p className="text-sm text-[#8A8A7A] mb-4 max-w-md mx-auto">{error}</p>
          <button
            id="btn-retry-users"
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-[#5A5A40] text-white text-sm font-medium rounded-lg hover:bg-[#4A4A35] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : isLoading && users.length === 0 ? (
        <div
          id="users-loading-state"
          className="bg-white border border-[#E0E0D5] rounded-xl p-12 text-center"
        >
          <div className="w-8 h-8 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#7A7A6A]">Loading user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          id="users-empty-state"
          className="bg-white border border-[#E0E0D5] rounded-xl p-12 text-center"
        >
          <UserIcon className="w-12 h-12 text-[#C8C8BA] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#3D3D2D] mb-1">
            {users.length === 0 ? 'No user accounts found' : 'No matching users'}
          </h3>
          <p className="text-sm text-[#8A8A7A] mb-4 max-w-sm mx-auto">
            {users.length === 0
              ? 'Create a new user account to grant system access.'
              : 'Try clearing your search query.'}
          </p>
          {users.length === 0 ? (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5A5A40] text-white text-sm font-medium rounded-lg hover:bg-[#4A4A35] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          ) : (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3.5 py-1.5 text-xs font-medium text-[#5A5A40] bg-[#F5F5F0] hover:bg-[#EAEAE0] rounded-lg transition-colors"
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <div
          id="users-table-card"
          className="bg-white border border-[#E0E0D5] rounded-xl shadow-xs overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table id="users-data-table" className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F5F5F0] border-b border-[#E0E0D5] text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0E5]">
                {filteredUsers.map((u) => {
                  const isSelf =
                    (currentUser && (u.user_id === currentUser.user_id || u.name === currentUser.name)) ??
                    false;

                  return (
                    <tr
                      key={u.user_id || u.name}
                      id={`user-row-${u.user_id}`}
                      className="hover:bg-[#FBFBF8] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#5A5A40]">
                        {u.user_id || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1A1A1A]">
                            {u.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] bg-[#ECECE4] text-[#5A5A40] px-1.5 py-0.5 rounded font-semibold">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            u.role === 'admin'
                              ? 'bg-[#ECECE4] text-[#5A5A40] border-[#D8D8CA]'
                              : 'bg-[#F5F5F0] text-[#7A7A6A] border-[#E0E0D5]'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <Shield className="w-3 h-3 text-[#5A5A40]" />
                          ) : (
                            <UserIcon className="w-3 h-3 text-[#7A7A6A]" />
                          )}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${
                            u.active
                              ? 'bg-[#E8EFE8] text-[#3D5A40] border-[#C8DCC8]'
                              : 'bg-[#F9ECEB] text-[#8C3A35] border-[#ECC8C5]'
                          }`}
                        >
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active/Disabled */}
                          <button
                            id={`btn-toggle-status-${u.user_id}`}
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.active
                                ? 'text-[#7A5A30] bg-[#FDF8EE] hover:bg-[#F8EEDA] border-[#EDE0C4]'
                                : 'text-[#3D5A40] bg-[#E8EFE8] hover:bg-[#D8E6D8] border-[#C8DCC8]'
                            }`}
                            title={u.active ? 'Disable User' : 'Enable User'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Change Password */}
                          <button
                            id={`btn-change-password-${u.user_id}`}
                            type="button"
                            onClick={() => setPasswordTargetUser(u)}
                            className="p-1.5 text-[#5A5A40] bg-[#F5F5F0] hover:bg-[#EAEAE0] border border-[#E0E0D5] rounded-lg transition-colors"
                            title="Change User Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            id={`btn-delete-user-${u.user_id}`}
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleDeleteUser(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'text-[#C8C8BA] border-[#F0F0E5] cursor-not-allowed'
                                : 'text-[#8C3A35] bg-[#F9ECEB] hover:bg-[#F3D7D5] border-[#ECC8C5]'
                            }`}
                            title={
                              isSelf
                                ? 'You cannot delete your own account'
                                : 'Delete User'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={() => fetchUsers(true)}
      />

      {/* Change Password Modal for Admin */}
      <ChangePasswordModal
        isOpen={Boolean(passwordTargetUser)}
        onClose={() => setPasswordTargetUser(null)}
        targetUserId={passwordTargetUser?.user_id}
        targetUserName={passwordTargetUser?.name}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        isLoading={isActionLoading}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
