import React, { useState } from 'react';
import { HeartHandshake, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  const displayError = localError || authError;

  return (
    <div className="login-page-backdrop">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-box">
            <HeartHandshake size={28} className="text-white" />
          </div>
          <div>
            <h1 className="login-brand-name">CareDrop</h1>
            <p className="login-brand-sub">Admin Console</p>
          </div>
        </div>

        <h2 className="login-title">Sign in to Admin</h2>
        <p className="login-subtitle">Platform administrators only</p>

        {displayError && <div className="login-error-alert">{displayError}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              className="login-input"
              placeholder="admin@caredrop.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right mt-1">
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset credentials.'); }} 
                className="login-forgot-link"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn flex-align-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner-anim" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
