import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Wall from './MainWall';
import Home from './Home';
import SharedWall from './SharedWall';
import DraftsPage from './DraftsPage';
import Upgrade from './Upgrade';
import { jwtDecode } from 'jwt-decode';
import ChatPanel from './ChatPanel';

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

// Move the main app logic into a new AppRoutes component
function AppRoutes({ user, setUser, users, setUsers }) {
  const location = useLocation();
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let newUser = null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.isAdmin && token) {
        newUser = { ...parsed, isAdmin: true, token };
      } else {
        newUser = { ...parsed, token };
      }
    } else if (token) {
      newUser = { username: 'admin', isAdmin: true, token };
    }
    if (JSON.stringify(user) !== JSON.stringify(newUser)) {
      setUser(newUser);
    }
    // Fetch plan features for the user if logged in and not admin
    if (newUser && !newUser.isAdmin && newUser.userid) {
      fetch(`http://localhost:5000/api/profile/${newUser.userid}`, {
        headers: { Authorization: `Bearer ${newUser.token}` }
      })
        .then(res => res.json())
        .then(profile => {
          if (profile && profile.features) {
            setUser(u => ({ ...u, plan: profile.plan, features: profile.features }));
            localStorage.setItem('user', JSON.stringify({ ...newUser, plan: profile.plan, features: profile.features }));
          }
        });
    }
  }, [location]);

  // Handle login
  const handleLogin = (userData) => {
    if (userData && userData.username === 'admin' && userData.isAdmin) {
      setUser({ ...userData, isAdmin: true });
    } else {
      setUser({ ...userData, isAdmin: false });
    }
  };
  const handleRegister = (userData) => { setUser(userData); };
  const handleLogout = () => { setUser(null); };
  const handleUserUpdate = (updatedUser) => { setUser(updatedUser); };
  const isAdminAuthenticated = () => user && (user.isAdmin || user.role === 'admin');

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
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
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="/chat" element={<ChatPanel user={user} />} />
      <Route path="/admin/*" element={isAdminAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route 
        path="*" 
        element={<Navigate to="/home" replace />} 
      />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.isAdmin && token) {
        return { ...parsed, isAdmin: true, token };
      }
      return { ...parsed, token };
    }
    if (token) {
      return { username: 'admin', isAdmin: true, token };
    }
    return null;
  });
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

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} users={users} setUsers={setUsers} />
    </Router>
  );
}

export default App; 
