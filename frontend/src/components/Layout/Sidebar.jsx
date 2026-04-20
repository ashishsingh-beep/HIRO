import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ currentUser, onLogout }) => {
  const isAdmin = currentUser?.role === 'admin';
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="material-icons-round brand-icon">insights</span>
        <h2>Hiro</h2>
      </div>
      <nav className="nav-menu">
        {isAdmin && (
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="material-icons-round">dashboard</span>
            Dashboard
          </Link>
        )}
        <Link
          to="/daily-entry"
          className={`nav-item ${isActive('/daily-entry') ? 'active' : ''}`}
        >
          <span className="material-icons-round">post_add</span>
          Daily Entry
        </Link>
        <Link
          to="/my-activity"
          className={`nav-item ${isActive('/my-activity') ? 'active' : ''}`}
        >
          <span className="material-icons-round">history</span>
          My Activity
        </Link>
        {isAdmin && (
          <Link
            to="/scorecards"
            className={`nav-item ${isActive('/scorecards') ? 'active' : ''}`}
          >
            <span className="material-icons-round">leaderboard</span>
            Scorecards
          </Link>
        )}
        {isAdmin && (
          <Link
            to="/reports"
            className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
          >
            <span className="material-icons-round">description</span>
            Reports
          </Link>
        )}
      </nav>
      <div className="sidebar-bottom">
        <Link to="/profile" className={`user-profile-link ${isActive('/profile') ? 'active' : ''}`}>
          <div className="user-profile">
            <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'User'}</span>
              <span className="user-role">
                {currentUser?.role === 'admin' ? 'Admin' : 'Recruiter'}
              </span>
            </div>
          </div>
        </Link>
        <button className="nav-item logout" onClick={onLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <span className="material-icons-round">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
