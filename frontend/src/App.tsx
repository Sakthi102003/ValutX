import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useVaultStore } from './store/vaultStore';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useVaultStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useVaultStore();

  // Security: Auto-lock on visibility change & inactivity
  const { updateActivity } = useVaultStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated) {
        // Optional: lock immediately when hidden
        // logout(); 
      }
    };

    const handleActivity = () => {
      if (isAuthenticated) {
        updateActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);

    // Initial activity set
    if (isAuthenticated) updateActivity();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
    };
  }, [isAuthenticated, updateActivity]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
