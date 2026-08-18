import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Users,
  LogOut,
  KeyRound,
  Menu,
  X,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import ChangePasswordModal from './Common/ChangePasswordModal';

interface NavbarProps {
  currentView: 'shipments' | 'users';
  onViewChange: (view: 'shipments' | 'users') => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'shipments' | 'users') => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="bg-white border-b border-[#E0E0D5] sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Brand & Desktop/Tablet Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 min-w-0">
            <div
              id="brand-header"
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => handleNavClick('shipments')}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#5A5A40] text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
                S
              </div>
              <div className="min-w-0">
                <span
                  id="app-nav-title"
                  className="font-bold text-[#3D3D2D] text-sm sm:text-base lg:text-lg tracking-tight block leading-tight truncate"
                >
                  Shipment Management
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#8A8A7A] font-medium hidden md:block leading-none mt-0.5">
                  Enterprise Logistics
                </span>
              </div>
            </div>

            {/* Nav Tabs for Admin (Desktop & Tablet) */}
            {isAdmin && (
              <nav id="admin-navigation-tabs" className="hidden md:flex items-center gap-1">
                <button
                  id="nav-tab-shipments"
                  type="button"
                  onClick={() => handleNavClick('shipments')}
                  title="Shipments"
                  aria-label="Shipments"
                  className={`flex items-center gap-1.5 p-2 xl:px-3 xl:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'shipments'
                      ? 'bg-[#EBEBE0] text-[#5A5A40] font-semibold'
                      : 'text-[#8A8A7A] hover:text-[#5A5A40] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden xl:inline">Shipments</span>
                </button>
                <button
                  id="nav-tab-users"
                  type="button"
                  onClick={() => handleNavClick('users')}
                  title="Manage Users"
                  aria-label="Manage Users"
                  className={`flex items-center gap-1.5 p-2 xl:px-3 xl:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'users'
                      ? 'bg-[#EBEBE0] text-[#5A5A40] font-semibold'
                      : 'text-[#8A8A7A] hover:text-[#5A5A40] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden xl:inline">Manage Users</span>
                </button>
              </nav>
            )}
          </div>

          {/* Right: Desktop & Tablet User Controls */}
          <div className="hidden md:flex items-center gap-1.5 xl:gap-3 shrink-0">
            {/* Desktop User Pill (>= 1200px / xl) */}
            <div
              id="user-profile-badge"
              className="hidden xl:flex items-center gap-2 py-1 px-3 bg-[#EBEBE0] rounded-full text-xs font-medium text-[#5A5A40]"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
              <span
                id="logged-in-user-name"
                className="max-w-[140px] truncate"
              >
                {isAdmin ? `Admin: ${user?.name}` : user?.name}
              </span>
              <span
                id="logged-in-user-role"
                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${
                  isAdmin
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#DCDCCF] text-[#5A5A40]'
                }`}
              >
                {user?.role}
              </span>
            </div>

            {/* Tablet Compact User / Account Icon (< 1200px / md to xl) */}
            <div
              id="user-profile-badge-tablet"
              title={`${isAdmin ? 'Admin: ' : ''}${user?.name || 'User'} (${user?.role || ''})`}
              aria-label={`User Account: ${user?.name || 'User'}`}
              className="flex xl:hidden items-center justify-center p-2 bg-[#EBEBE0] hover:bg-[#E0E0D5] text-[#5A5A40] rounded-lg transition-colors relative cursor-default"
            >
              <UserIcon className="w-4 h-4" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1.5 right-1.5 ring-1 ring-white" />
            </div>

            {/* Change Password Button */}
            <button
              id="btn-change-password"
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              title="Change Password"
              className="p-2 xl:p-1.5 text-[#8A8A7A] hover:text-[#5A5A40] hover:bg-[#F5F5F0] rounded-lg transition-colors"
              aria-label="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              id="btn-logout"
              type="button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="flex items-center gap-1.5 p-2 xl:px-3 xl:py-1.5 text-xs font-medium text-[#B24A4A] bg-[#FAF3F3] hover:bg-[#F2E8E8] border border-[#ECDCDC] rounded-lg transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4 xl:w-3.5 xl:h-3.5" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Right: Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#5A5A40] hover:bg-[#F5F5F0] rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className="md:hidden border-t border-[#E0E0D5] py-3 space-y-3 bg-[#FBFBF8] -mx-3 px-4 shadow-inner animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* User Info Card */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E0E0D5]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EBEBE0] text-[#5A5A40] flex items-center justify-center font-bold text-xs shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#3D3D2D] truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-[#8A8A7A] truncate">
                    {user?.user_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                    isAdmin
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-[#EBEBE0] text-[#5A5A40]'
                  }`}
                >
                  {user?.role}
                </span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
              </div>
            </div>

            {/* Navigation Links for Admin */}
            {isAdmin && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="mobile-nav-btn-shipments"
                  type="button"
                  onClick={() => handleNavClick('shipments')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentView === 'shipments'
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-white text-[#5A5A40] border border-[#E0E0D5] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Shipments</span>
                </button>
                <button
                  id="mobile-nav-btn-users"
                  type="button"
                  onClick={() => handleNavClick('users')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentView === 'users'
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-white text-[#5A5A40] border border-[#E0E0D5] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Users</span>
                </button>
              </div>
            )}

            {/* Actions: Change Password & Logout */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="mobile-btn-change-password"
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#5A5A40] bg-white border border-[#E0E0D5] rounded-lg hover:bg-[#F5F5F0] transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
              <button
                id="mobile-btn-logout"
                type="button"
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#B24A4A] bg-[#FAF3F3] border border-[#ECDCDC] rounded-lg hover:bg-[#F2E8E8] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </header>
  );
}
