import { useEffect } from 'react';
import { useVaultStore } from './store/vaultStore';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  // Using isAuthenticated from the new store logic
  const { isAuthenticated, logout } = useVaultStore();

  // Security: Auto-lock on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated) {
        // Auto-lock logic can be enabled here using logout() or a softer lock
        // For now, we keep it manually triggered or simple
        // logout(); 
      }
    };

    // Prevent memory leaks / insecure handling on unload
    // Note: modern browsers restrict what you can do here, but clearing state is good practice
    // although React state is memory-only anyway.

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, logout]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // If we had a "Locked but User Known" state we would use UnlockPage here.
  // But our new flow treats Logout == Locked. 
  // If we want to persist email for quick unlock, we'd need a separate state 'userEmail' + 'isLocked'.
  // Currently vaultStore sets isLocked=true on logout.
  // We can refine this later if we want "Unlock" vs "Login".

  return <Dashboard />;
}

export default App;
