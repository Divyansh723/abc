import { StrictMode, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageLayout } from './components/layout';
import { useAuth } from './hooks/useAuth';
import { useAccentColorStore } from './stores/accentColorStore';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { setAccentColor } = useAccentColorStore();
  
  // Apply user's accent color preference
  useEffect(() => {
    if (user?.accentColor) {
      setAccentColor(user.accentColor);
    }
  }, [user?.accentColor, setAccentColor]);
  
  // Routes that should not have the sidebar layout
  const publicRoutes = [
    '/', 
    '/test-auth', 
    '/test-login',
    '/features',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms'
  ];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Show PageLayout (with sidebar) only for authenticated users on protected routes
  if (isAuthenticated && !isPublicRoute) {
    return (
      <PageLayout>
        <AppRoutes />
      </PageLayout>
    );
  }
  
  // Show routes without sidebar for public pages
  return <AppRoutes />;
}

function App() {
  return (
    <StrictMode>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppContent />
        </Router>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;