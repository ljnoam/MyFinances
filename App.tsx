import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import { DataProvider } from './lib/dataContext';
import { ThemeProvider } from './lib/themeContext';
import { SettingsProvider } from './lib/settingsContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Transactions } from './pages/transactions/Transactions';
import { Stats } from './pages/stats/Stats';
import { Savings } from './pages/savings/Savings';
import { Insights } from './pages/insights/Insights';
import { Profile } from './pages/profile/Profile';
import { PrivacyPolicy, Terms, Security } from './pages/legal/Legal';
import { BottomNav } from './components/layout/BottomNav';
import { CookieBanner } from './components/layout/CookieBanner';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : <Outlet />;
};

const MainLayout = () => {
  return (
    <div className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="relative min-h-screen w-full mx-auto bg-background">
        <Outlet />
        <BottomNav />
        <CookieBanner />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <DataProvider>
            <Router>
              <Routes>
                {/* Routes Publiques (Login/Register) */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Pages Légales (Accessibles hors connexion) */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/security" element={<Security />} />

                {/* Routes Privées (Avec Navbar) */}
                <Route element={<PrivateRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Legal Routes also accessible here to keep Navbar */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/security" element={<Security />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </DataProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;