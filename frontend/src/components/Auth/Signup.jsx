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
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
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

  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Full name is required';
    if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Name must contain only letters';
    if (trimmed.length < 3 || trimmed.length > 50) return 'Name must be between 3 and 50 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return 'Password must include uppercase, lowercase, number, and special character';
    }
    return '';
  };

  const validateRole = (role) => {
    if (!role) return 'Please select a role';
    if (!['recruiter', 'admin'].includes(role)) return 'Please select a role';
    return '';
  };

  const getPasswordStrength = (password) => {
    if (!password) return '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthColor = (str) => {
    if (str === 'Weak') return 'var(--danger)';
    if (str === 'Medium') return 'var(--warning)';
    if (str === 'Strong') return 'var(--success)';
    return 'transparent';
  };

  const isFormValid = !errors.name && !errors.email && !errors.password && !errors.role && 
                      formData.name && formData.email && formData.password && formData.role &&
                      validateName(formData.name) === '' &&
                      validateEmail(formData.email) === '' &&
                      validatePassword(formData.password) === '' &&
                      validateRole(formData.role) === '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    
    // Sanitize input (trim names)
    const sanitizedName = formData.name.trim();
    const sanitizedEmail = formData.email.trim().toLowerCase();

    try {
      const response = await fetch(API_ROUTES.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(prev => ({ ...prev, ...data.errors }));
        }
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
    const fieldName = e.target.id.replace('signup-', '');
    const value = e.target.value;
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Inline validation & error clearance
    let err = '';
    if (fieldName === 'name') {
      err = validateName(value);
    } else if (fieldName === 'email') {
      err = validateEmail(value);
    } else if (fieldName === 'password') {
      err = validatePassword(value);
    } else if (fieldName === 'role') {
      err = validateRole(value);
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: err }));
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="John Doe"
                  required
                  className={errors.name ? 'input-error' : ''}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="name@company.com"
                  required
                  className={errors.email ? 'input-error' : ''}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="password-field-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    placeholder="••••••••"
                    required
                    className={errors.password ? 'input-error' : ''}
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
                
                {formData.password && (
                  <div className="password-strength-container mt-1" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-xs text-muted" style={{ fontSize: '0.75rem' }}>Password Strength: </span>
                      <strong style={{ color: getStrengthColor(passwordStrength), fontSize: '0.75rem', fontWeight: '700' }}>{passwordStrength}</strong>
                    </div>
                    <div className="strength-bar-bg" style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div className="strength-bar-fill" style={{ 
                        height: '100%', 
                        width: passwordStrength === 'Weak' ? '33%' : passwordStrength === 'Medium' ? '66%' : passwordStrength === 'Strong' ? '100%' : '0%', 
                        background: getStrengthColor(passwordStrength),
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="signup-role">Role</label>
                <select 
                  id="signup-role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  required
                  className={errors.role ? 'input-error' : ''}
                >
                  <option value="recruiter">Recruiter</option>
                  {!adminExists && <option value="admin">HR Manager (Admin)</option>}
                </select>
                {errors.role && <p className="error-text">{errors.role}</p>}
                {adminExists && <p className="text-xs text-muted mt-1">HR Manager role is already assigned.</p>}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading || !isFormValid}
                style={{ 
                  opacity: (loading || !isFormValid) ? 0.6 : 1, 
                  cursor: (loading || !isFormValid) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
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
