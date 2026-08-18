import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import ShipmentsView from './components/Shipments/ShipmentsView';
import UsersView from './components/Admin/UsersView';

function AppContent() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'shipments' | 'users'>('shipments');

  if (!isAuthenticated) {
    return <Login />;
  }

  // Ensure non-admin users cannot switch to admin-only views
  const activeView =
    !isAdmin && currentView === 'users'
      ? 'shipments'
      : currentView;

  return (
    <div id="app-root-layout" className="min-h-screen bg-[#F5F5F0] flex flex-col text-[#1A1A1A] antialiased">
      <Navbar
        currentView={activeView}
        onViewChange={(view) => {
          if (view === 'users' && !isAdmin) return;
          setCurrentView(view);
        }}
      />
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'shipments' && <ShipmentsView />}
        {activeView === 'users' && <UsersView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
