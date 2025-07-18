import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState([]); // Shared users state

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Handle register (auto-login)
  const handleRegister = (userData) => {
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={user ? "/home" : "/login"} />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/home" /> : <Login onLogin={handleLogin} users={users} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/home" /> : <Register onRegister={handleRegister} users={users} setUsers={setUsers} />} 
        />
        <Route 
          path="/home" 
          element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App; 
