import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider } from './components/ToastNotification';
import Navigation from './components/Navigation';
import MobileBottomNavigation from './components/MobileBottomNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Home from './pages/Home';
import Content from './pages/Content';
import ContentDetails from './pages/ContentDetails';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Channels from './pages/Channels';
import AI from './pages/AI';
import Profile from './pages/Profile';
import ChannelChat from './pages/ChannelChat';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Content component that uses theme context
const AppContent = () => {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <ErrorBoundary>
            <Navigation />
            <Box sx={{ pb: { xs: 7, md: 0 } }}> {/* Add bottom padding for mobile navigation */}
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
                <Route path="/content/:id/:type" element={<ProtectedRoute><ContentDetails /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                <Route path="/channels" element={<ProtectedRoute><Channels /></ProtectedRoute>} />
                <Route path="/channels/:channelId/chat" element={<ProtectedRoute><ChannelChat /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <MobileBottomNavigation />
          </ErrorBoundary>
        </div>
      </Router>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
