import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './components/Dashboard/Dashboard';
import EntryForm from './components/Recruiter/EntryForm';
import RecruiterHistory from './components/Recruiter/RecruiterHistory';
import Scorecards from './components/Scorecards/Scorecards';
import Reports from './components/Reports/Reports';
import Profile from './components/Profile/Profile';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('hiro_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
    } else {
      // Only navigate to login if not already on signup
      if (location.pathname !== '/signup') {
        navigate('/login');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('hiro_user', JSON.stringify(user));
    navigate(user.role === 'admin' ? '/dashboard' : '/daily-entry');
  };

  const handleLogout = () => {
    localStorage.removeItem('hiro_user');
    localStorage.removeItem('hiro_token');
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) return <div className="view-auth"><h2>Loading Hiro...</h2></div>;

  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '12px 24px',
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/daily-entry'} /> : 
          <Login onLoginSuccess={handleLoginSuccess} onShowSignup={() => navigate('/signup')} />
        } />
        
        <Route path="/signup" element={
          currentUser ? <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/daily-entry'} /> : 
          <Signup onShowLogin={() => navigate('/login')} />
        } />

        <Route path="/" element={
          !currentUser ? <Navigate to="/login" /> : 
          <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/daily-entry'} />
        } />

        {/* Authenticated Layout Wrapper */}
        <Route path="/*" element={
          !currentUser ? <Navigate to="/login" /> : (
            <div className="layout">
              <Sidebar currentUser={currentUser} onLogout={handleLogout} />
              <main className="main-content">
                <Topbar currentView={location.pathname.replace('/', '')} currentUser={currentUser} />
                <div className="content-area">
                  <Routes>
                    <Route path="dashboard" element={currentUser.role === 'admin' ? <Dashboard /> : <Navigate to="/daily-entry" />} />
                    <Route path="daily-entry" element={<EntryForm currentUser={currentUser} />} />
                    <Route path="my-activity" element={<RecruiterHistory currentUser={currentUser} />} />
                    <Route path="scorecards" element={currentUser.role === 'admin' ? <Scorecards /> : <Navigate to="/daily-entry" />} />
                    <Route path="reports" element={currentUser.role === 'admin' ? <Reports /> : <Navigate to="/daily-entry" />} />
                    <Route path="profile" element={<Profile currentUser={currentUser} onLogout={handleLogout} />} />
                  </Routes>
                </div>
              </main>
            </div>
          )
        } />
      </Routes>
    </>
  );
}

export default App;
