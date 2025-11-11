import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithToken, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback with token
  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Google authentication failed. Please try again.');
      // Remove error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      // Use loginWithToken from context
      loginWithToken(token).then((result) => {
        if (result.success) {
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          // Navigate to home
          navigate('/', { replace: true });
        } else {
          setError(result.error || 'Failed to complete Google sign-in. Please try again.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [searchParams, loginWithToken, navigate]);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    setFieldError({});
    
    // Validate form
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields');
      if (!usernameOrEmail) setFieldError(prev => ({ ...prev, usernameOrEmail: 'Username or email is required' }));
      if (!password) setFieldError(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    try {
      setLoading(true);
      console.log('Attempting login with:', { usernameOrEmail });
      const result = await login({ usernameOrEmail, password });
      
      if (result && result.success) {
        console.log('Login successful:', result.user);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/', { replace: true });
      } else {
        console.error('Login failed:', result.error);
        if (result.field) {
          // Provide more user-friendly error messages
          let errorMessage = result.error;
          
          // Make the error messages more helpful
          if (result.field === 'usernameOrEmail' && result.error.includes('No account found')) {
            errorMessage = 'No account found with this username or email. Please check your spelling or register a new account.';
          } else if (result.field === 'password' && result.error.includes('Incorrect password')) {
            errorMessage = 'Incorrect password. Please try again or use the forgot password link.';
          }
          
          setFieldError(prev => ({ ...prev, [result.field]: errorMessage }));
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = 'http://localhost:5000/api/auth/google';
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              disabled={loading}
              className={fieldError.usernameOrEmail ? 'error-input' : ''}
            />
            {fieldError.usernameOrEmail && (
              <div className="field-error">{fieldError.usernameOrEmail}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              className={fieldError.password ? 'error-input' : ''}
            />
            {fieldError.password && (
              <div className="field-error">{fieldError.password}</div>
            )}
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-container">
          <button
            onClick={handleGoogleLogin}
            className="google-login-button"
            type="button"
          >
            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;