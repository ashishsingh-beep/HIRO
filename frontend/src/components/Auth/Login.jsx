import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../api/supabase';
import { API_ROUTES } from '../../api/config';

const Login = ({ onLoginSuccess, onShowSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token to localStorage for authenticated API calls
      localStorage.setItem('hiro_token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      toast.error('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="view-auth">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="brand">
            <span className="material-icons-round brand-icon">insights</span>
            <h1>Hiro</h1>
          </div>
          <h2>Elevate your HR performance.</h2>
          <p>Track productivity, monitor the hiring funnel, and optimize your recruitment process in real-time.</p>
          <div className="login-illustration">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-box">
            <h3>Welcome Back</h3>
            <p className="subtitle">Sign in to your account</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-field-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span 
                    className="material-icons-round password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
              <div className="form-options">
                <label className="checkbox-container">
                  Remember me
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                </label>
                <span className="forgot-link">Forgot password?</span>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="form-footer mt-4 text-center">
              <p className="text-sm text-muted">
                Don't have an account?{' '}
                <span className="forgot-link" onClick={onShowSignup}>
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
