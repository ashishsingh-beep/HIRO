import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../api/supabase';
import { API_ROUTES } from '../../api/config';

const Signup = ({ onShowLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'recruiter'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(API_ROUTES.ADMIN_EXISTS);
        const data = await res.json();
        setAdminExists(data.exists);
      } catch (err) {
        console.error('Failed to check admin status:', err);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ROUTES.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success('Signup successful! Please log in.');
      onShowLogin();
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Signup failed: ' + err.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id.replace('signup-', '')]: e.target.value });
  };

  return (
    <div className="view-auth">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand">
            <span className="material-icons-round brand-icon">insights</span>
            <h1>Hiro</h1>
          </div>
          <h2>Join the force.</h2>
          <p>Start tracking your recruitment productivity and achieve your targets with data-driven insights.</p>
          <div className="login-illustration">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-box">
            <h3>Create Account</h3>
            <p className="subtitle">Join Hiro Recruitment Tracker</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="name@company.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="password-field-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    placeholder="••••••••"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span 
                    className="material-icons-round password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signup-role">Role</label>
                <select id="signup-role" value={formData.role} onChange={handleChange} required>
                  <option value="recruiter">Recruiter</option>
                  {!adminExists && <option value="admin">HR Manager (Admin)</option>}
                </select>
                {adminExists && <p className="text-xs text-muted mt-1">HR Manager role is already assigned.</p>}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="form-footer mt-4 text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <span className="forgot-link" onClick={onShowLogin}>
                  Sign In
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
