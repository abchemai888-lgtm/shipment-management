import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const success = await login(trimmedName, password);
    if (!success) {
      // Local error message state is also updated if needed
    }
  };

  return (
    <div
      id="login-container"
      className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        id="login-card"
        className="w-full max-w-md bg-white border border-[#E0E0D5] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div
            id="login-logo-badge"
            className="w-12 h-12 bg-[#5A5A40] text-white rounded-xl flex items-center justify-center mb-3 shadow-xs font-bold text-lg"
          >
            <Package className="w-6 h-6" />
          </div>
          <h1
            id="login-title"
            className="text-2xl font-bold text-[#3D3D2D] tracking-tight"
          >
            Shipment Management
          </h1>
          <p className="text-sm text-[#8A8A7A] mt-1">
            Sign in to access your shipment operations
          </p>
        </div>

        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg font-medium"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all placeholder:text-[#B0B0A0]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A090]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all placeholder:text-[#B0B0A0]"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[#5A5A40] hover:bg-[#4A4A35] active:bg-[#3D3D2D] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0F0E5] text-center">
          <p className="text-xs text-[#8A8A7A]">
            Powered by Google Sheets & Apps Script Backend
          </p>
        </div>
      </div>
    </div>
  );
}
