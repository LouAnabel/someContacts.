import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/theme/ThemeContext.jsx'

// Layout components
import UserLayout from './components/layout/UserLayout_Auth.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';

// Page components
import Login from './pages/Login_auth.jsx'
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import AllContacts from './pages/AllContacts.jsx';
import AddContact from './pages/AddContact.jsx';
import ShowContact from './pages/ShowContact.jsx';
import UpdateContacts from './pages/UpdateContact.jsx';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/hello/login" replace />;
}

// Public Route Component (redirect if already authenticated)
function PublicRoute({ children, isAuthenticated }) {
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  const DEV_MODE = true;
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_MODE);
  const [isLoading, setIsLoading] = useState(!DEV_MODE);

  // Check authentication status on app load
  useEffect(() => {
    if (DEV_MODE) {
      console.log('DEV MODE: skipping auth check');
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false); // Allow starting unauthenticated
      }
      setIsLoading(false);
      return;
    }

    const checkAuthStatus = () => {
      // Check for stored auth token/session
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        // Validate token if needed (you might want to call an API to verify)
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);


  // Authentication functions
  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsAuthenticated(true);

    if (DEV_MODE) {
    console.log('🔧 DEV MODE: User logged in', userData)
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

 

  return (
    <ThemeProvider> 
      <Router>
        <Routes>
          {/* Public routes with AuthLayout (shows login/register/logout links) */}
          <Route 
            path="/hello/*" 
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
              <AuthLayout />
              </PublicRoute>
            }
          >
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route index element={<Navigate to="login" replace />} />
          </Route>

          {/* Protected routes - only accessible when authenticated */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <UserLayout onLogout={logout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="contacts" element={<AllContacts />} />
            <Route path="addcontact" element={<AddContact />} />
            <Route path="contact/:id" element={<ShowContact />} />
            <Route path="updatecontact/:id" element={<UpdateContacts />} />
          </Route>

        {/* Logout route */}
          <Route 
            path="/logout" 
            element={<LogoutHandler onLogout={logout} />} 
          />
        {/* Catch all route - redirect based on auth status */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={isAuthenticated ? "/" : "/hello/login"} 
                replace 
              />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Simple logout handler component
function LogoutHandler({ onLogout }) {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return <Navigate to="/hello/login" replace />;
}

export default App;