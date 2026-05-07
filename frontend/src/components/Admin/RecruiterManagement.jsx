import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_ROUTES } from '../../api/config';

const RecruiterManagement = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hiro_token');
      const response = await fetch(API_ROUTES.RECRUITERS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch recruiters');
      setRecruiters(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRecruiterStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('hiro_token');
      const response = await fetch(`${API_ROUTES.RECRUITERS}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      
      toast.success(`${data.name} has been ${status === 'approved' ? 'approved (valid)' : 'rejected (invalid)'}!`);
      fetchRecruiters(); // Refresh listing
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredRecruiters = recruiters.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'pending') {
      return r.status === 'pending' && matchesSearch;
    }
    return matchesSearch;
  });

  const pendingCount = recruiters.filter(r => r.status === 'pending').length;
  const approvedCount = recruiters.filter(r => r.status === 'approved').length;

  return (
    <div className="section-view">
      {/* Metrics Banner */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          <div className="kpi-icon yellow"><span className="material-icons-round">pending_actions</span></div>
          <div className="kpi-info">
            <h3>Pending Approvals</h3>
            <div className="kpi-value">{pendingCount}</div>
          </div>
        </div>
        <div className="kpi-card" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="kpi-icon green"><span className="material-icons-round">verified_user</span></div>
          <div className="kpi-info">
            <h3>Approved Recruiters</h3>
            <div className="kpi-value">{approvedCount}</div>
          </div>
        </div>
        <div className="kpi-card" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div className="kpi-icon blue"><span className="material-icons-round">group</span></div>
          <div className="kpi-info">
            <h3>Total Registered</h3>
            <div className="kpi-value">{recruiters.length}</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div className="tabs-wrapper" style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('pending')}
            style={{ padding: '0.5rem 1.25rem', height: '40px' }}
          >
            Pending Requests {pendingCount > 0 && <span style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'inherit', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px', fontWeight: 'bold', display: 'inline-block' }}>{pendingCount}</span>}
          </button>
          <button 
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('all')}
            style={{ padding: '0.5rem 1.25rem', height: '40px' }}
          >
            All Registered Directory
          </button>
        </div>

        <div className="search-box" style={{ width: '300px' }}>
          <span className="material-icons-round">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Main List Table */}
      <div className="card mt-4" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{activeTab === 'pending' ? 'Pending Approval Queue' : 'Recruiter Accounts Directory'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{activeTab === 'pending' ? 'Review requests to verify whether a recruiter is valid.' : 'Full registry of all recruiters registered in the tracker'}</p>
        </div>
        
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-icons-round spinner-animation" style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear', display: 'inline-block' }}>sync</span>
            <p className="mt-2">Loading profiles...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recruiter ID</th>
                  <th>Recruiter Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  {activeTab === 'pending' && <th style={{ textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRecruiters.length > 0 ? (
                  filteredRecruiters.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-muted)' }}>
                        #{r.id ? r.id.substring(0, 6).toUpperCase() : 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem', flexShrink: 0 }}>{r.name.charAt(0)}</div>
                          <strong>{r.name}</strong>
                        </div>
                      </td>
                      <td>{r.email}</td>
                      <td style={{ textTransform: 'capitalize', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {r.role || 'recruiter'}
                      </td>
                      <td>{new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                      <td>
                        <span className={`badge-pill ${r.status}`} style={{
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          {r.status === 'approved' ? 'Valid' : r.status === 'rejected' ? 'Invalid' : 'Pending Review'}
                        </span>
                      </td>
                      {activeTab === 'pending' && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {r.status !== 'approved' && (
                              <button 
                                className="btn btn-outline" 
                                onClick={() => updateRecruiterStatus(r.id, 'approved')}
                                style={{ border: '1px solid var(--success)', color: 'var(--success)', padding: '0.4rem 0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '34px', background: 'transparent' }}
                                title="Mark as Real & Valid recruiter"
                              >
                                <span className="material-icons-round" style={{ fontSize: '1rem' }}>check_circle</span>
                                Approve
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button 
                                className="btn btn-outline" 
                                onClick={() => updateRecruiterStatus(r.id, 'rejected')}
                                style={{ border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem 0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center', height: '34px', background: 'transparent' }}
                                title="Mark as Suspended/Invalid"
                              >
                                <span className="material-icons-round" style={{ fontSize: '1rem' }}>cancel</span>
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'pending' ? '7' : '6'} className="text-center" style={{ padding: '4rem 0', color: 'var(--text-muted)' }}>
                      <span className="material-icons-round" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>people_outline</span>
                      <p style={{ fontWeight: '500' }}>No recruiters found matching the filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-animation {
          animation: spin 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default RecruiterManagement;
