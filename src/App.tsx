import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CoffeeBeanIcon } from './components/CoffeeBeanIcon';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { LanguageProvider } from './context/LanguageContext';
import { CustomerLayout } from './components/CustomerLayout';
import { LoginPage } from './pages/LoginPage';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { CustomerCardPage } from './pages/CustomerCardPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { CustomerMorePage } from './pages/CustomerMorePage';
import { ScannerPage } from './pages/ScannerPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminMenuPage } from './pages/AdminMenuPage';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminMessagesPage } from './pages/AdminMessagesPage';
import type { UserRole } from './lib/database.types';

const ProtectedRoute: React.FC<{
  allowedRoles: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}> = ({ allowedRoles, redirectTo = '/login', children }) => {
  const { isLoadingAuth, currentUser } = useAppState();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#1C140D] text-[#F5EBE1] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#2D221A] border border-[#3E3025] flex items-center justify-center text-[#D89D60]">
          <CoffeeBeanIcon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm text-[#A39284]">
          <Loader2 className="w-4 h-4 animate-spin text-[#D89D60]" />
          <span>Ověřování relace...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Pokud role nemá přístup, přesměrujeme uživatele na jeho odpovídající obrazovku
  if (!allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.role === 'staff') {
      return <Navigate to="/scanner" replace />;
    }
    return <Navigate to="/app/home" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isLoadingAuth, currentUser } = useAppState();
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#1C140D] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#D89D60]" />
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (currentUser.role === 'staff') return <Navigate to="/scanner" replace />;
  return <Navigate to="/app/home" replace />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppStateProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            {/* Výchozí přesměrování podle přihlášení a role */}
            <Route path="/" element={<RootRedirect />} />

            {/* Jednotná přihlašovací stránka pro všechny role */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            {/* Zákaznická část (/app/*) – přístup pro customer, staff i admin */}
            <Route
              path="/app"
              element={
                <ProtectedRoute
                  allowedRoles={['customer', 'staff', 'admin']}
                  redirectTo="/login"
                >
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<CustomerHomePage />} />
              <Route path="menu" element={<CustomerMenuPage />} />
              <Route path="card" element={<CustomerCardPage />} />
              <Route path="account" element={<CustomerAccountPage />} />
              <Route path="more" element={<CustomerMorePage />} />
            </Route>

            {/* Rozhraní pro baristu (/scanner) – pouze role staff a admin */}
            <Route
              path="/scanner"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'admin']}
                  redirectTo="/login"
                >
                  <ScannerPage />
                </ProtectedRoute>
              }
            />

            {/* Administrace (/admin/*) – pouze role admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={['admin']}
                  redirectTo="/login"
                >
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute
                  allowedRoles={['admin']}
                  redirectTo="/login"
                >
                  <AdminMenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute
                  allowedRoles={['admin']}
                  redirectTo="/login"
                >
                  <AdminEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute
                  allowedRoles={['admin']}
                  redirectTo="/login"
                >
                  <AdminStaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute
                  allowedRoles={['admin']}
                  redirectTo="/login"
                >
                  <AdminMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </LanguageProvider>
  );
};

export default App;
