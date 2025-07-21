import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Wall from './MainWall';
import Home from './Home';
import SharedWall from './SharedWall';
import DraftsPage from './DraftsPage';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Optionally log error
  }
  render() {
    if (this.state.hasError) {
      return <h2 style={{ color: '#c62828', textAlign: 'center', marginTop: 40 }}>Something went wrong. Please refresh the page.</h2>;
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // If admin, ensure isAdmin and token are set
      if (parsed.isAdmin && token) {
        return { ...parsed, isAdmin: true, token };
      }
      return { ...parsed, token };
    }
    if (token) {
      // Fallback for admin login without user object
      return { username: 'admin', isAdmin: true, token };
    }
    return null;
  });
  console.log('Loaded user from localStorage:', user);
  const [users, setUsers] = useState([]); // Shared users state

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.token) localStorage.setItem('token', user.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  // Handle login
  const handleLogin = (userData) => {
    // If admin login, set isAdmin flag
    if (userData && userData.username === 'admin' && userData.isAdmin) {
      setUser({ ...userData, isAdmin: true });
    } else {
      setUser({ ...userData, isAdmin: false });
    }
  };

  // Handle register (auto-login)
  const handleRegister = (userData) => {
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
  };

  // Handle user update
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const isAdminAuthenticated = () => !!localStorage.getItem('adminToken');

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/wall" /> : <Login key="login" onLogin={handleLogin} users={users} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/wall" /> : <Register onRegister={handleRegister} users={users} setUsers={setUsers} />} 
            />
            <Route 
              path="/wall" 
              element={user ? <Wall user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wall/draft/:id" 
              element={user ? <SharedWall user={user} onLogout={handleLogout} /> : <Navigate to="/home" />} 
            />
            <Route 
              path="/drafts" 
              element={<DraftsPage />} 
            />
            {/* Admin login is now handled by the main login page */}
            <Route path="/admin/*" element={isAdminAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route 
              path="*" 
              element={<Navigate to="/home" />} 
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 
