import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { API_ROUTES } from '../../api/config';
import Modal from '../UI/Modal';

const Profile = ({ currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('hiro_token');
      if (token) {
        const response = await fetch(API_ROUTES.ME, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
          setEditForm({ name: data.name, email: data.email });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('hiro_token');
      const response = await fetch(API_ROUTES.ME, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Update failed');
      
      setProfile(prev => ({ ...prev, ...result }));
      
      const savedUser = JSON.parse(localStorage.getItem('hiro_user'));
      localStorage.setItem('hiro_user', JSON.stringify({ ...savedUser, name: result.name, email: result.email }));
      
      setIsEditing(false);
      setModalState({ 
        isOpen: true, 
        title: 'Profile Updated', 
        message: 'Your personal details have been updated successfully!', 
        type: 'success' 
      });
    } catch (error) {
      setModalState({ isOpen: true, title: 'Update Failed', message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const closeModalAndRefresh = () => {
    setModalState({ ...modalState, isOpen: false });
    if (modalState.type === 'success') {
      window.location.reload();
    }
  };

  if (loading) return <div className="text-center mt-4">Loading profile...</div>;

  return (
    <div className="section-view">
      <div className="profile-card">
        <div className="profile-avatar-xl pulse-border">
          {profile?.name?.charAt(0) || 'U'}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSave} className="edit-profile-form">
            <div className="form-group text-left">
                <label>Full Name</label>
                <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                    className="form-input"
                />
            </div>
            <div className="form-group text-left">
                <label>Email Address</label>
                <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                    className="form-input"
                />
            </div>
            <div className="flex-actions mt-4" style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                    Cancel
                </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="profile-name">{profile?.name}</h2>
            <p className="subtitle">{profile?.role === 'admin' ? 'Strategic HR Lead' : 'Talent Acquisition Specialist'}</p>

            <div className="profile-stats-row">
                <div className="stat-pill">
                    <span className="s-val">{profile?.stats?.total_reports || 0}</span>
                    <span className="s-lbl">TOTAL REPORTS</span>
                </div>
                <div className="stat-pill">
                    <span className="s-val">Active</span>
                    <span className="s-lbl">STATUS</span>
                </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-icon blue">
                  <span className="material-icons-round">email</span>
                </div>
                <div className="detail-content">
                  <label>Email Address</label>
                  <span>{profile?.email}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon purple">
                  <span className="material-icons-round">manage_accounts</span>
                </div>
                <div className="detail-content">
                  <label>Account Role</label>
                  <span>{profile?.role === 'admin' ? 'Administrator' : 'Recruiter'}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon green">
                  <span className="material-icons-round">calendar_today</span>
                </div>
                <div className="detail-content">
                  <label>Joined Hiro</label>
                  <span>{new Date(profile?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button 
                className="btn btn-outline btn-block" 
                onClick={() => setIsEditing(true)}
              >
                <span className="material-icons-round">edit</span>
                Edit Personal Details
              </button>
            </div>
          </>
        )}
      </div>

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModalAndRefresh}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default Profile;
