import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import ToastContainer, { ToastMessage } from './components/Toast';
import AuthModal from './components/AuthModal';
import PasswordResetModal from './components/PasswordResetModal';
import ReceiptModal from './components/ReceiptModal';

import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import TrainersPage from './pages/TrainersPage';
import PaymentsPage from './pages/PaymentsPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer';

import { Role, User } from './types';
import { setApiCallbacks } from './api/axios';
import authApi from './api/authApi';
import { userApi } from './api/userApi';

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authApi.getCurrentUser() || null;
  });
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const stored = authApi.getCurrentUser();
    return (stored?.role as Role) || 'MEMBER';
  });
  const [viewMode, setViewMode] = useState<'portal' | 'landing'>(() => {
    return authApi.getCurrentUser() ? 'portal' : 'landing';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any>(null);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Configure API Interceptors callbacks
    setApiCallbacks(
      (msg, type) => addToast(msg, type),
      () => {
        setCurrentUser(null);
        setViewMode('landing');
      }
    );

    // User session resolution directly from backend database
    const initUser = async () => {
      const storedUser = authApi.getCurrentUser();
      if (!storedUser) {
        setCurrentUser(null);
        setViewMode('landing');
        return;
      }

      const identifier = storedUser.id || storedUser.email;
      try {
        const backendProfile = await userApi.getProfile(identifier);
        if (backendProfile) {
          setCurrentUser(backendProfile);
          setActiveRole(backendProfile.role || storedUser.role || 'MEMBER');
          setViewMode('portal');
          return;
        }
      } catch (err) {
        console.warn('Could not fetch backend profile on init:', err);
      }

      setCurrentUser(storedUser);
      setActiveRole(storedUser.role);
      setViewMode('portal');
    };

    initUser();
  }, []);

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
    setActiveTab('dashboard');
    setViewMode('portal');
    addToast(`Switched to ${role} Portal View`, 'info');
  };

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setViewMode('portal');
    setActiveTab('dashboard');
  };

  const handleSignOut = () => {
    authApi.logout();
    setCurrentUser(null);
    setViewMode('landing');
    addToast('Signed out of PowerHouse Gym Management.', 'info');
  };

  const handleOpenReceiptModal = (payment: any) => {
    setSelectedReceiptPayment(payment);
    setReceiptModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {viewMode === 'landing' ? (
        <LandingPage
          onOpenSignIn={() => setAuthModalOpen(true)}
          onShowToast={addToast}
        />
      ) : (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            activeRole={activeRole}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />

          {/* Main Dashboard Layout */}
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar
              currentUser={currentUser}
              activeRole={activeRole}
              onRoleChange={handleRoleChange}
              onOpenNotifications={() => setActiveTab('notifications')}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <main className="p-6 md:p-8 flex-1 overflow-y-auto">
              {activeTab === 'dashboard' && (
                <DashboardPage
                  activeRole={activeRole}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onShowReceiptModal={handleOpenReceiptModal}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'members' && (
                <MembersPage
                  activeRole={activeRole}
                  currentUser={currentUser}
                  onShowToast={addToast}
                  onShowReceiptModal={handleOpenReceiptModal}
                />
              )}

              {activeTab === 'trainers' && (
                <TrainersPage activeRole={activeRole} currentUser={currentUser} onShowToast={addToast} />
              )}

              {activeTab === 'payments' && (
                <PaymentsPage
                  activeRole={activeRole}
                  currentUser={currentUser}
                  onShowReceiptModal={handleOpenReceiptModal}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'users' && (
                <UsersPage activeRole={activeRole} currentUser={currentUser} onShowToast={addToast} />
              )}

              {activeTab === 'notifications' && (
                <NotificationsPage
                  activeRole={activeRole}
                  currentUser={currentUser}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePage
                  currentUser={currentUser}
                  activeRole={activeRole}
                  onOpenPasswordReset={() => setPasswordResetModalOpen(true)}
                  onShowToast={addToast}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
                />
              )}
            </main>

            {/* Footer with Gym Details & Quick Links */}
            <Footer onNavigateTab={(tab) => setActiveTab(tab)} />
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onShowToast={addToast}
      />

      <PasswordResetModal
        isOpen={passwordResetModalOpen}
        onClose={() => setPasswordResetModalOpen(false)}
        onShowToast={addToast}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        payment={selectedReceiptPayment}
        onShowToast={addToast}
      />
    </div>
  );
}

export default App;
