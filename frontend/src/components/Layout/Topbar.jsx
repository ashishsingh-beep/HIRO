import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

const Topbar = ({ currentView, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const titles = {
    dashboard: 'Dashboard',
    'daily-entry': 'Daily Entry',
    'my-activity': 'My Activity',
    scorecards: 'Scorecards',
    reports: 'Reports'
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchNotifications();
      
      const channel = supabase
        .channel('admin-notifications')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications' 
        }, (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
            // Play sound or show toast here if desired
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications(data || []);
  };

  const markAsRead = async () => {
    setNotifications([]);
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  };

  return (
    <header className="topbar">
      <div className="page-title">
        <h2>{titles[currentView] || 'Overview'}</h2>
      </div>
      <div className="topbar-actions">
        
        <div className="notification-wrapper">
          <button className="icon-btn" onClick={() => { setShowDropdown(!showDropdown); if(showDropdown) markAsRead(); }}>
            <span className="material-icons-round">notifications</span>
            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown card">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && <span className="badge-new">{notifications.length} New</span>}
              </div>
              <div className="dropdown-body">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="notification-item">
                      <div className="n-icon"><span className="material-icons-round">description</span></div>
                      <div className="n-content">
                        <p>{n.message}</p>
                        <small>{new Date(n.created_at).toLocaleTimeString()}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
